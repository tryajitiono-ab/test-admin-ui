import fs from 'fs'

const secondTournamentContent = fs.readFileSync('swaggers/secondtournament.json', 'utf-8')
fs.writeFileSync(
  'swaggers/secondtournament.json',
  secondTournamentContent.replaceAll(`"tags": ["TournamentService"]`, `"tags": ["SecondTournamentService"]`),
  'utf-8'
)
