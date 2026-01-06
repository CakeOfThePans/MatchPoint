import { updateMatchAndPlayers } from '../services/matchService.js'

const temp = await updateMatchAndPlayers(3096984, 2)
console.log(temp)