import React from 'react'
export const PredictionBar = ({
  player1,
  player2,
  confidenceScore,
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-sm font-medium">
        <span>
          {player1.name} ({player1.chance}%)
        </span>
        <span>
          {player2.name} ({player2.chance}%)
        </span>
      </div>
      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-600 rounded-l-full"
          style={{
            width: `${player1.chance}%`,
          }}
        />
      </div>
      {confidenceScore !== undefined && (
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-center">
          <span>Prediction confidence: </span>
          <span className="ml-1 font-medium">{confidenceScore}%</span>
        </div>
      )}
    </div>
  )
}

export default PredictionBar