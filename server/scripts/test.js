import prisma from '../lib/prisma.js'

async function main(){
	const matches = await prisma.match.findMany({
		where: {
			match_id: 2796459,
		},
		include: {
			home_team: true,
			away_team: true,
			winner: true,
			tournament: true,
		},
	})
	console.log(matches)
}

main()