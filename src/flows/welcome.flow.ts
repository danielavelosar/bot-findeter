import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { BaileysProvider } from '@bot-whatsapp/provider-baileys'
import { MemoryDB } from '@bot-whatsapp/bot'
import conversationalLayer from "src/layers/conversational.layer";
import mainLayer from "src/layers/main.layer";

/**
 * Este flow responde a cualquier palabra que escriban
 */
export default addKeyword(EVENTS.WELCOME)
    .addAction(conversationalLayer)
    .addAction(mainLayer)

// export default addKeyword<BaileysProvider, MemoryDB>(['hello', 'hi'])
//     .addAction(conversationalLayer)
//     .addAction(mainLayer)