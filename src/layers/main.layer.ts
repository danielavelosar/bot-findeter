import { BotContext, BotMethods } from "@bot-whatsapp/bot/dist/types"
import { getHistoryParse } from "../utils/handleHistory"
import AIClass from "../services/ai"
import { flowSeller } from "../flows/seller.flow"
import { flowSchedule } from "../flows/schedule.flow"
import { flowConfirm } from "../flows/confirm.flow"

/**
 * Determina que flujo va a iniciarse basado en el historial que previo entre el bot y el humano
 */
export default async (_: BotContext, { state, gotoFlow, extensions }: BotMethods) => {
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const prompt = `Como una inteligencia artificial avanzada, tu tarea es analizar el contexto de una conversación y determinar cuál de las siguientes acciones es más apropiada para realizar:
    --------------------------------------------------------
    Eres parte de una empresa que otorga créditos de segundo nivel (a asociaciones, cooperativas, etc.). El cliente previamente ha otorgado diferentes datos para que la empresa sepa su riesgo de préstamo, la empresa llena un excel con los riesgos calculados del cliente pero se demora un tiempo porque esto se calcula con empleados humanos de la empresa
    Historial de conversación:
    {HISTORY}
    
    Posibles acciones a realizar:
    1. CONSULTAR: Esta acción se debe realizar cuando el cliente expresa su deseo de saber su riesgo de crédito.
    2. HABLAR: Esta acción se debe realizar cuando el cliente desea hacer una pregunta o necesita más información.
    3. ENVIAR_CORREO: Esta acción se debe realizar cuando el cliente expresa querer que se le envíe por correo la información detallada sobre cómo mejorar su puntaje de crédito basado en confianza.
    -----------------------------
    Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
    
    Respuesta ideal (CONSULTAR|HABLAR|ENVIAR_CORREO):`.replace('{HISTORY}', history)

    const text = await ai.createChat([
        {
            role: 'system',
            content: prompt
        }
    ])

    if ((text as string).includes('HABLAR')) return gotoFlow(flowSeller)
    if ((text as string).includes('CONSULTAR')) return gotoFlow(flowSchedule)
    if ((text as string).includes('ENVIAR_CORREO')) return gotoFlow(flowConfirm)
}