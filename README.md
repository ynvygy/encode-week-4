# encode-week-4

How to run backend : yarn start:dev 
How to run frontend : npm run dev

Backend requires an .env file that contains:
TOKEN_ADDRESS
BALLOT_ADDRESS
ALCHEMY_API_KEY
PRIVATE_KEY (this would have to be changed based on request tokens)

Way of running :
(encode-week-3 repo)
1. deploy token
2. deploy ballot
3. config encode-week-4
(encode-week-4 repo)
4. request tokens (calls backend, so remember to check the PRIVATE_KEY)
5. delegate (from frontend)
6. vote (from frontend)

Other functionalities :
- GetWinner
- Proposals List

Some notes:
- I changed the folder structure to just backend and frontend to make it less fuzzy than it was
- Tested on mumbai -> token and ballot addresses can be found in the InstructionsComponent.jsx
- Didn't use dotenv because of some local problems
