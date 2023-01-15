// calls contract functions
import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis, Moralis } from "react-moralis"
import { abi, contractAddresses } from "../constants/index"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)

    // console.log(chainId)

    // console.log(chainIdHex)

    const [entranceFee, setEntranceFee] = useState("0")
    const [numberPlayers, setNumberPlayers] = useState("0")
    const [lastWinner, setLastWinner] = useState("0")

    const raffleAddress =
        chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // console.log(raffleAddress)

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    async function updateUI() {
        const callEntranceFee = (await getEntranceFee()).toString()
        setEntranceFee(callEntranceFee)

        const callNumberPlayers = (await getNumberOfPlayers()).toString()
        setNumberPlayers(callNumberPlayers)

        const callLastWinner = (await getRecentWinner()).toString()
        setLastWinner(callLastWinner)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction complete!",
            title: "Tx notification",
            position: "topR",
            type: "success",
        })
    }

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    // async function winListener() {
    //     await new Promise(async (resolve, reject) => {
    //         const provider = new ethers.providers.JsonRpcProvider(
    //             "http://127.0.0.1:8545/"
    //         )
    //         // const raffle = await ethers.getContract("Raffle", provider)
    //         raffle.once("WinnerPicked", async () => {
    //             console.log("winner found")
    //             try {
    //                 updateUI()
    //             } catch (e) {
    //                 reject(e)
    //             }
    //             resolve()
    //         })
    //     })
    // }

    // winListener()

    return (
        <div className="p-5">
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isFetching || isLoading}
                    >
                        {isLoading || isFetching ? (
                            <div
                                className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"
                                role="status"
                            ></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>

                    <div>
                        Entrance Fee:{" "}
                        {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                    </div>
                    <div>Number of Players: {numberPlayers}</div>
                    <div>Last Winner: {lastWinner}</div>
                </div>
            ) : (
                <div>No raffle address detected</div>
            )}
        </div>
    )
}
