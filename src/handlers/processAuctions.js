import getEndedAuctions from "../lib/getEndedAuctions.js";
import closeAuction from "../lib/closeAuction.js";
import createError from "http-errors";

export async function processAuctions() {

    try {
        const auctionsToClose = await getEndedAuctions();
        const closePromises = auctionsToClose.map(auction => closeAuction(auction));
        await Promise.all(closePromises);
        return { closed: closePromises.length };
    }
    catch (error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
}

export const handler = processAuctions;