import Estimator from "./Estimator";
import Faq from "./Faq";
import Process from "./Process";
import Simulator from "./Simulator";

/**
 * As seções interativas mais abaixo vêm num pacote separado: a primeira
 * tela carrega sem elas e elas chegam assim que o navegador fica livre.
 */
export default function Below() {
  return (
    <>
      <Simulator />
      <Estimator />
      <Process />
      <Faq />
    </>
  );
}
