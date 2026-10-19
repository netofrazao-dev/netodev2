import { createContext, useContext } from "react";

/**
 * "Palco liberado": vira true quando a abertura termina. As entradas da
 * página esperam por isso para não acontecerem escondidas atrás da cortina.
 */
export const StageContext = createContext(true);
export const useStage = () => useContext(StageContext);
