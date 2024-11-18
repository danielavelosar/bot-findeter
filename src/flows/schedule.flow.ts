import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { getCurrentCalendar } from "../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";

const PROMPT_SCHEDULE = `
Como ingeniero de inteligencia artificial especializado en el envío de reportes para mejora de taza de riesgo de préstamo, tu objetivo es analizar la conversación y determinar la intención del cliente de saber si su préstamo ya ha sido análizado, así como otorgarle las posibles mejoras para su taza de riesgo, en el caso en el que tenga una taza de riesgo muy alta.


Excel con el estado actual:
-----------------------------------
{EXCEL_ACTUAL}

Historial de Conversacion:
-----------------------------------
{HISTORIAL_CONVERSACION}

NOMBRES DE LOS SERVICIOS DE MEJORA DE PUNTAJE DE RIESGO:
- Certificación en gestión de proyectos
- Curso en gestión de la economía popular
- Capacitación en economía digital y banca 

Ejemplos de respuestas adecuadas para mostrar al cliente su riesgo de crédito actual, si lo tiene, y es "Malo" o "Medio" enseñarle los cursos, capacitaciones y certificaciones que tiene findeter para mejorar su crédito basado en confianza, si es "Favorable" felicitarlo y si no lo tiene decirle que aún no ha sido realizado el proceso:
----------------------------------
"¡El riesgo de préstamo ya ha sido analizado!, estos son tus resultados de riesgo: "
"El puntaje de riesgo es un poco alto pero puedes mejorar tu puntaje de riesgo. ¿Deseas saber cómo?"
"Ciertamente, si quieres puedo enviar a tu correo la información detallada de la ruta sobre como mejorar el puntaje de riesgo de su organización"
"¡El puntaje de riesgo para la asociación es bajo! Felicidades, acércate a findeter para obtener tu crédito"
Parece que tu puntaje de riesgo aún no ha sido calculado, pero no te preocupes, pronto tendrás noticias de nosotros.

INSTRUCCIONES:
- (NO) saludes
- Revisar detalladamente el historial de conversación y saber el nombre del cliente para que no haya conflicto con la revisión del excel
- Respuestas cortas ideales para enviar por whatsapp con emojis
-----------------------------
Respuesta útil en primera persona:`

const generateSchedulePrompt = (summary: string, history: string) => {
    const mainPrompt = PROMPT_SCHEDULE
        .replace('{EXCEL_ACTUAL}', summary)
        .replace('{HISTORIAL_CONVERSACION}', history)

    return mainPrompt
}

/**
 * Hable sobre todo lo referente a agendar citas, revisar historial saber si existe huecos disponibles
 */
const flowSchedule = addKeyword(EVENTS.ACTION).addAction(async (ctx, { extensions, state, flowDynamic }) => {
    await flowDynamic('dame un momento para consultar el riesgo de préstamo...')
    const ai = extensions.ai as AIClass
    const history = getHistoryParse(state)
    const list = await getCurrentCalendar()
    const promptSchedule = generateSchedulePrompt(list?.length ? list : 'ninguna', history)

    const text = await ai.createChat([
        {
            role: 'system',
            content: promptSchedule
        },
        {
            role: 'user',
            content: `Cliente pregunta: ${ctx.body}`
        }
    ], 'gpt-4')

    await handleHistory({ content: text, role: 'assistant' }, state)

    const chunks = text.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
        await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }

})

export { flowSchedule }