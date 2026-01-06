from collections import defaultdict
import sys
import os
import pandas as pd
import numpy as np
import re
import unidecode
import difflib

STOPWORDS = {
    "atp","wta","tour","tournament","championship","championships","open",
    "masters","master","the","international"
}

# Add aliases so different strings collapse to the same event/city key
EVENT_ALIASES = {
    "roland garros": "french open",
    "canada masters": "canadian open",
}

def clean_tourney(s: str) -> str:
    if not isinstance(s, str):
        return ""
    t = unidecode.unidecode(s.lower())
    t = t.replace("&", " ")
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()

    # quick alias hit before stopword stripping (for long official names)
    if t in EVENT_ALIASES:
        return EVENT_ALIASES[t]

    toks = [w for w in t.split() if w and w not in STOPWORDS]
    return " ".join(toks).strip()


def player_signature(name: str):
    """
    Returns: (last_name, first_initial)

    Rules:
    - If name ends with '.', treat as odds format.
      Everything after the surname is considered initials, including:
        'J.L.', 'Zh.', 'J. P.', etc.
      First initial = first letter of the initials chunk.
    - Otherwise treat as Sackmann format: 'First ... Last'
    - Last name is ALWAYS the final surname token only.
    """
    if not isinstance(name, str):
        return ("", "")

    raw = name.strip()
    is_odds = raw.endswith(".")

    text = unidecode.unidecode(raw.lower())
    text = re.sub(r"[^a-z\s\.]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return ("", "")

    toks = [t for t in text.split() if t]
    if not toks:
        return ("", "")

    if is_odds:
        # Split surname vs initials:
        # surname tokens = everything up to the first token that contains a dot
        surname_tokens = []
        initials_tokens = []

        for t in toks:
            if "." in t:
                initials_tokens.append(t)
            elif initials_tokens:
                initials_tokens.append(t)
            else:
                surname_tokens.append(t)

        # Last name = final surname token only
        last_name = surname_tokens[-1] if surname_tokens else ""

        # Initials: join everything, strip dots, take first letter
        init_blob = "".join(initials_tokens)          # e.g. "j.p." or "zh."
        init_clean = re.sub(r"[^a-z]", "", init_blob) # "jp" or "zh"
        first_init = init_clean[0] if init_clean else ""

        return (last_name, first_init)

    # Sackmann: "First ... Last"
    first_init = toks[0][0]
    last_name = toks[-1]
    return (last_name, first_init)

def sig_key(sig):
    # Only last + first initial (no middle)
    return f"{sig[0]}|{sig[1]}"

def sim(a, b):
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(None, a, b).ratio()

def main():
    if len(sys.argv) != 4:
        print("Usage: python merge_pipeline.py <sack_path> <odds_path> <out_path>")
        sys.exit(1)

    # Construct paths with proper folder structure
    # Example inputs: "atp_matches_2024.csv", "2024.xlsx", "2024_atp_matches_with_odds.csv"
    # Will be converted to paths like: "data/raw/sackmann/atp_matches_2024.csv", etc.
    sack_filename = sys.argv[1]
    odds_filename = sys.argv[2]
    out_filename = sys.argv[3]

    # Get the model directory (parent of pipelines directory)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.dirname(script_dir)
    
    # Construct paths relative to model directory
    sack_path = os.path.join(model_dir, 'data', 'raw', 'sackmann', sack_filename)
    odds_path = os.path.join(model_dir, 'data', 'raw', 'odds', odds_filename)
    out_path = os.path.join(model_dir, 'data', 'processed', out_filename)

    sack = pd.read_csv(sack_path)
    odds = pd.read_excel(odds_path)
    # ---------- Sackmann prep ----------
    sack2 = sack.copy()
    sack2["sack_idx"] = np.arange(len(sack2))
    sack2["w_sig"] = sack2["winner_name"].apply(lambda x: sig_key(player_signature(x)))
    sack2["l_sig"] = sack2["loser_name"].apply(lambda x: sig_key(player_signature(x)))
    sack2["tourney_clean"] = sack2["tourney_name"].apply(clean_tourney)

    # ---------- Odds prep ----------
    odds2 = odds.copy()
    odds2["odds_idx"] = odds2.index
    odds2["w_sig"] = odds2["Winner"].apply(lambda x: sig_key(player_signature(x)))
    odds2["l_sig"] = odds2["Loser"].apply(lambda x: sig_key(player_signature(x)))
    odds2["loc_clean"] = odds2["Location"].apply(clean_tourney)
    odds2["tourn_clean"] = odds2["Tournament"].apply(clean_tourney)

    # Build lookup: (w_sig, l_sig) -> list of odds row indices
    pair_to_odds = defaultdict(list)
    for i, (w, l) in enumerate(zip(odds2["w_sig"], odds2["l_sig"])):
        pair_to_odds[(w, l)].append(i)

    def pick_best_odds_row(row, min_tourney_sim=0.6):
        cands = pair_to_odds.get((row["w_sig"], row["l_sig"]), [])
        if not cands:
            return np.nan

        best_score = -1
        best_i = None
        t = row["tourney_clean"]

        for i in cands:
            oc = odds2.iloc[i]
            score = max(sim(t, oc["loc_clean"]), sim(t, oc["tourn_clean"]))
            if score > best_score:
                best_score = score
                best_i = i

        if best_score < min_tourney_sim:
            return np.nan

        return odds2.iloc[best_i]["odds_idx"]

    # Find the matching odds row for each Sackmann row
    sack2["odds_match_idx"] = sack2.apply(pick_best_odds_row, axis=1)

    # Merge only AvgW and AvgL columns from odds
    merged = sack2.merge(
        odds2[["odds_idx", "AvgW", "AvgL"]],
        how="left",
        left_on="odds_match_idx",
        right_on="odds_idx",
        suffixes=("", "_odds")
    )

    # For testing purposes
    # merged.drop(
    #     columns=[
    #         "tourney_id","surface","draw_size","tourney_level","tourney_date","match_num",
    #         "winner_id","winner_ioc","winner_seed","winner_entry","winner_hand","winner_ht",
    #         "winner_age","winner_rank","winner_rank_points",
    #         "loser_id","loser_seed","loser_ioc","loser_entry","loser_hand","loser_ht",
    #         "loser_age","loser_rank","loser_rank_points",
    #         "best_of","round","score","minutes",
    #         "w_ace","w_df","w_svpt","w_1stIn","w_1stWon","w_2ndWon","w_SvGms","w_bpSaved","w_bpFaced",
    #         "l_ace","l_df","l_svpt","l_1stIn","l_1stWon","l_2ndWon","l_SvGms","l_bpSaved","l_bpFaced",
    #         "winner_rank","winner_rank_points","loser_rank","loser_rank_points"
    #     ],
    #     inplace=True,
    #     errors="ignore"
    # )

    # Count matches (rows where odds_idx is not null after threshold filtering)
    total_matches = merged["odds_idx"].notna().sum()
    total_rows = len(merged)

    merged.drop(columns=["sack_idx", "odds_idx", "odds_match_idx", "w_sig", "l_sig", "tourney_clean"], inplace=True)

    merged.to_csv(out_path, index=False)
    print(f"Wrote: {out_path}")
    print(f"Total rows: {total_rows}")
    print(f"Total matches: {total_matches} ({total_matches/total_rows*100:.1f}%)")

# Example usage:
# python .\pipelines\merge_pipeline.py atp_matches_2024.csv 2024.xlsx 2024_atp_matches_with_odds.csv
if __name__ == "__main__":
    main()