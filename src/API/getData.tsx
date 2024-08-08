import { createOrGetWallet, getWalletCCNTPBalance, importWallet, startMining, stopMining, getRouletteResult, registerReferrer } from ".";

export const fetchWalletData = async (): Promise<any> => {
    try {
        const response = await createOrGetWallet();
        if (Array.isArray(response) && response.length >= 2) {
            const [status] = response;
            if (status === "SUCCESS") {
                return response;
            } else {
                console.error("Failed to fetch wallet data");
            }
        }
    } catch (error) {
        console.error("Failed to fetch wallet data", error);
    }

    return { error: true, message: "Failed to fetch wallet data" };
}

export const fetchCNTPBalance = async (walletAddress: string): Promise<any> => {
    try {
        const response = await getWalletCCNTPBalance(walletAddress);
        if (Array.isArray(response) && response.length >= 2) {
            const [status, balance] = response;
            if (status === "SUCCESS") {
                return response;
            } else {
                console.error("Failed to fetch CNTP balance");
            }
        }
    } catch (error) {
        console.error("Failed to fetch CNTP balance", error);
    }

    return { error: true, message: "Failed to fetch CNTP balance" };
};

export const fetchImportWallet = async (walletPrivateKey: string): Promise<any> => {
    try {
        const response = await importWallet(walletPrivateKey);
        if (Array.isArray(response) && response.length >= 2) {
            const [status] = response;
            if (status === "SUCCESS") {
                return response[1][0];
            } else {
                console.error("Failed to import wallet");
            }
        }
    } catch (error) {
        console.error("Failed to import wallet", error);
    }

    return { error: true, message: "Failed to import wallet" };
}

export const fetchStartMining = async (walletAddress: string): Promise<any> => {
    try {
        const response = await startMining(walletAddress);

        if (Array.isArray(response) && response.length >= 2) {
            const [status, data] = response;
            if (status === "SUCCESS") {
                try {
                    const parsedData = JSON.parse(data[1]);
                    return parsedData;
                } catch (error) {
                    console.error("Failed to parse mining data", error);
                }
            } else {
                console.error("Failed to start mining");
            }
        }
    } catch (error) {
        console.error("Error to start mining", error);
    }

    return { error: true, message: `Failed to start mining. Please check if someone else is mining in your network.` };
}

export const fetchstopMining = async (walletAddress: string): Promise<any> => {
    try {
        const response = await stopMining(walletAddress);
        if (Array.isArray(response) && response.length >= 2) {
            const [status, address] = response;
            if (status === "SUCCESS") {
                return status;
            } else {
                console.error("Failed to stop mining");
            }
        }
    } catch (error) {
        console.error("Failed to stop mining", error);
    }

    return { error: true, message: "Failed to stop mining" };
}

export const fetchRouletteResult = async (walletAddress: string): Promise<any> => {
    if (walletAddress) {
        try {
            const response = await getRouletteResult(walletAddress);

            if (Array.isArray(response) && response.length >= 2) {
                const [status, data] = response;
                if (status === "SUCCESS") {
                    return data[0]?.lottery;
                } else {
                    console.error("Failed to fetch roulette result");
                }
            }
        } catch (error) {
            console.error("Failed to fetch roulette result", error);
        }
    }

    return { error: true, message: "Failed to fetch roulette result" };
}

export const fetchRegisterResult = async (referrerAddress: string): Promise<any> => {
    try {
        const response = await registerReferrer(referrerAddress);

        if (Array.isArray(response) && response.length >= 2) {
            const [status, data] = response;
            if (status === "SUCCESS") {
                return data[0];
            } else {
                console.error("Failed to add referrer");
            }
        }
    } catch (error) {
        console.error("Failed to add referrer", error);
    }

    return { error: true, message: "Failed to add referrer" };
}
