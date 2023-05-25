import styles from "../styles/InstructionsComponent.module.css";
import Router, { useRouter } from "next/router";
import { useSigner, useNetwork, useBalance } from "wagmi";
import { useState, useEffect } from 'react';
import tokenJson from '../contractsdata/MyToken.json';
import ballotJson from '../contractsdata/TokenizedBallot.json';
import {ethers} from 'ethers';

// I was unable to do it with process.env, i probably had to do some extra setup and i went for the easy route
const TOKEN_ADDRESS="0x60243c03b2f9a7390cD8542F13baB1627db8d783"
const BALLOT_ADDRESS="0x42089347470E5143B2D55D87E1766610c3FE6dFe"
const DELEGATE_ADDRESS="0x3e702E39e0649bd8581D07a5bf1b9e5924d94Ce0"
//const DELEGATE_ADDRESS="0x73047EE0903e8A9A4c4D2448e56Bc89850D37e4A"

export default function InstructionsComponent() {
	const router = useRouter();
	return (
		<div className={styles.container}>
			<header className={styles.header_container}>
				<h1>
					my dapp
				</h1>
			</header>

			<div className={styles.buttons_container}>
				<PageBody></PageBody>
			</div>

			<div className={styles.footer}>
				Footer
			</div>
		</div>
	);
}

function PageBody() {
	return (
		<>
			<WalletInfo></WalletInfo>
		</>
	)
}

function WalletInfo() {
	const { data: signer, isError, isLoading } = useSigner();
	const { chain, chains } = useNetwork();
	if (signer) return (
		<>
			<p>Your account address is {signer._address}</p>
			<p>Connected to the {chain.name} network</p>
			<button onClick={() => signMessage(signer, "I love potatoes")}>Sign</button>
			<WalletBalance></WalletBalance>
			<ApiInfo></ApiInfo>
			<RequestTokens></RequestTokens>
			<DelegateTokens></DelegateTokens>
			<ListProposals></ListProposals>
			<CastVote></CastVote>
			<GetWinner></GetWinner>
			<FetchVotes></FetchVotes>
		</>
	)
	if (isLoading) return (
		<>
			<p>Wait a while, the wallet is loading</p>
		</>
	)
	return (
		<>
			<p>Connect a wallet</p>
		</>
	)
}

function WalletBalance() {
	const { data: signer } = useSigner();
	const { data, isError, isLoading } = useBalance({
		address: signer._address,
	})
	if (isLoading) return <div> Fetching balance </div>
	if (isError) return <div> Error fetching balance</div>
	return (
		<div>Balance: {data?.formatted} {data?.symbol}</div>
	)
}

function signMessage(signer, message) {
	signer.signMessage(message).then(
		(signature) => {
			console.log(signature),
			(error) => {console.error(error)}
		}
	)
}

function ApiInfo() {
	const [data, setData] = useState(null);
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		fetch('https://random-data-api.com/api/v2/users')
			.then((res) => res.json())
			.then((data) => {
				setData(data);
				setLoading(false);
			});
	}, []);

	if (isLoading) return <p>Loading</p>
	if (!data) return <p>No profile data</p>

	return(
		<div>
			<h1>{data.username}</h1>
			<p> {data.email}</p>
		</div>
	)
}

function RequestTokens() {
	const {data : signer } = useSigner();
	const [txData, setTxData] = useState(null);
	const [isLoading, setLoading] = useState(false);
	
	if (txData) return ( <div> <p>Transaction completed!</p> <a href={"https://mumbai.polygonscan.com/tx/" + txData.hash} target="_blank">{txData.hash}</a> </div> ) 
	if (isLoading) return <p>Requesting tokens to be minted...</p>;
	
	return (
		<div> 
			<button onClick={() => requestTokens(signer, "signature", setLoading, setTxData)}>Request Tokens</button>
		</div>
	)
}

function requestTokens(signer, signature, setLoading, setTxData) { setLoading(true); 
	const requestOptions = { 
		method: 'POST', 
		headers: { 
			'Content-Type': 'application/json' 
		}, 
		body: JSON.stringify({ address: signer._address, signature: signature }) 
	}; 
	fetch('http://localhost:3001/request-tokens', requestOptions) 
		.then(response => response.json()) 
		.then((data) => { setTxData(data); setLoading(true); 
	});
}

function DelegateTokens() {
  const { data: signer } = useSigner();
  const [txData, setTxData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const delegateTokens = async () => {
    setLoading(true);

    try {
      const contract = new ethers.Contract(
        TOKEN_ADDRESS,
        tokenJson.abi,
        signer
      );

      const tx = await contract.delegate(DELEGATE_ADDRESS);

      setTxData(tx);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  if (txData) {
    return (
      <div>
        <p>Transaction completed!</p>
        <a href={`https://mumbai.polygonscan.com/tx/${txData.hash}`} target="_blank">
          {txData.hash}
        </a>
      </div>
    );
  }

  if (isLoading) {
    return <p>Delegating tokens</p>;
  }

  return (
    <div>
      <button onClick={delegateTokens}>Delegate Tokens</button>
    </div>
  );
}

function CastVote() {
  const { data: signer } = useSigner();
  const [txData, setTxData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [proposal, setProposal] = useState(0);
  const [voteAmount, setVoteAmount] = useState(0);

  const castVote = async () => {
    setLoading(true);

    try {
      const contract = new ethers.Contract(
        BALLOT_ADDRESS,
        ballotJson.abi,
        signer
      );

      const tx = await contract.vote(proposal, voteAmount);

      setTxData(tx);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  if (txData)
    return (
      <div>
        <p>Transaction completed!</p>
        <a href={`https://mumbai.polygonscan.com/tx/${txData.hash}`} target="_blank">
          {txData.hash}
        </a>
      </div>
    );
  if (isLoading) return <p>Casting Vote</p>;

  return (
    <div>
      <label>
        Proposal:
        <input
          type="number"
          value={proposal}
          onChange={(e) => setProposal(parseInt(e.target.value))}
        />
      </label>
      <label>
        Vote Amount:
        <input
          type="number"
          value={voteAmount}
          onChange={(e) => setVoteAmount(parseInt(e.target.value))}
        />
      </label>
      <button onClick={castVote}>Cast Vote</button>
    </div>
  );
}

function GetWinner() {
	const {data : signer } = useSigner();
	const [txData, setTxData] = useState(null);
	const [isLoading, setLoading] = useState(false);
	
	const getWinner = async () => {
    setLoading(true);

    try {
      const contract = new ethers.Contract(
        BALLOT_ADDRESS,
        ballotJson.abi,
        signer
      );

      const tx = await contract.winnerName();
      setTxData(ethers.utils.parseBytes32String(tx));
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

	if (txData) return ( <div> <p>Transaction completed! The winner is {txData}</p></div> ) 
	if (isLoading) return <p>Getting the winner...</p>;
	
	return (
		<div> 
			<button onClick={getWinner}>Winner Name</button>
		</div>
	)
}

function FetchVotes() {
  const [votes, setVotes] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const fetchVotes = async () => {
    setLoading(true);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        BALLOT_ADDRESS,
        ballotJson.abi,
        signer
      );

      const proposalNames = await contract.listProposal();
      const voteCounts = [];
      for (let i = 0; i < proposalNames.length; i++) {
        const voteCount = await contract.proposals(i);
        voteCounts.push({ name: ethers.utils.parseBytes32String(proposalNames[i]), count: voteCount[1].toString() });
      }

      setVotes(voteCounts);
    } catch (error) {
      console.error('Error fetching votes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchVotes} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Votes'}
      </button>

      {votes.length > 0 && (
        <ul>
          {votes.map((vote, index) => (
            <li key={index}>
              {vote.name}: {vote.count}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ListProposals() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
				BALLOT_ADDRESS,
        ballotJson.abi,
        provider
      );

      const proposalNames = await contract.listProposal();

      const convertedProposals = proposalNames.map((proposal) =>
        ethers.utils.parseBytes32String(proposal)
      );

      setProposals(convertedProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  return (
    <div>
      <h3>List of Proposals</h3>
      {proposals.length > 0 ? (
        <ul>
          {proposals.map((proposal, index) => (
            <li key={index}>{proposal} with index: {index}</li>
          ))}
        </ul>
      ) : (
        <p>No proposals found.</p>
      )}
    </div>
  );
}