import RecaptchaPlugin from "puppeteer-extra-plugin-recaptcha";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import db from "../../utils/db";

const rename = promisify(fs.rename);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

puppeteer.use(StealthPlugin());
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: "2captcha",
      token: "2b6904bb5b8740d1bd135030e76b5c5b", // Tu clave de API de 2Captcha aquí
    },
    visualFeedback: true, // Opcional, mostrará una superposición sobre las páginas web con CAPTCHA
  })
);

async function pageSelect(page, element, value, intentos = 1) {
  let contador = 0;
  let success = false;
  if (intentos == 0) intentos += 100;
  while (contador < intentos && !success) {
    try {
      await delay(250);
      await page.select(element, value);
      success = true;
    } catch (err) {
      console.log(err);
      contador++;
    }
  }
  return success;
}

async function pageClick(page, element, intentos = 1) {
  let contador = 0;
  let success = false;
  while (contador < intentos && !success) {
    try {
      await delay(250);
      await page.click(element);
      success = true;
    } catch (err) {
      console.log(err);
      contador++;
    }
  }
  return success;
}

function delay(t, val) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(val);
    }, t);
  });
}

export const sriDocRecibido = async ({
  ruc,
  password,
  anio,
  mes,
  tipoComprobante,
  dia,
}) => {
  //let dia = "0";

  console.log("RUC:", ruc);
  console.log("Password:", password);
  console.log("Año:", anio);
  console.log("Mes:", mes);
  console.log("Tipo de Comprobante:", tipoComprobante);
  console.log("Día:", dia);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    console.log("******* Consultando Elemento  *******");
    //const browser = await puppeteer.launch({ headless: true });

    let data = [];

    // Configura la carpeta de descargas
    const downloadPath = path.resolve("./downloads/" + ruc);
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
    }

    // Establece el comportamiento de descarga
    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: downloadPath,
    });

    console.log("******* Entering the page *******");
    await page.goto("https://srienlinea.sri.gob.ec/sri-en-linea/inicio/NAT", {
      waitUntil: "networkidle2",
      timeout: 300000,
    });

    // Mostrar el contenido de la página antes de hacer clic en el enlace
    //const pageContent1 = await page.content();
    //console.log(pageContent1);

    // Espera hasta que el elemento esté disponible en el DOM
    await page.waitForSelector("a.sri-tamano-link-iniciar-sesion", {
      timeout: 10000,
    });

    // Desplazar el elemento a la vista
    await page.evaluate(() => {
      //document.querySelector('a.sri-tamano-link-iniciar-sesion').scrollIntoView();
      let link = document.querySelector("a.sri-tamano-link-iniciar-sesion");
      link.click();
    });

    console.log("click");

    // Espera un breve momento para asegurarse de que el desplazamiento se complete
    await page.waitForTimeout(3000);

    await page.waitForSelector("#usuario", {
      timeout: 90000,
    });

    await page.type("#usuario", ruc);
    await page.type("#password", password);
    await page.click("#kc-login");
    console.log("Information: Iniciando Sesión");

    await page.waitForNavigation({ waitUntil: "networkidle0" });
    const pathUrl = "/auth/realms/Internet/login-actions/authenticate";

    let errorMsg =
      "Error al ingresar a comprobantes recibidos, revise su usuario y contraseña";
    if (page.url().includes(pathUrl)) throw new Error();
    //console.log(typeof page.url());

    //let anio= '2024';
    //let mes = '7';
    //let dia = '0';
    //let tipoComprobante = '1';

    console.log("Information: Entrando a comprobantes recibidos");
    await page.goto(
      "https://srienlinea.sri.gob.ec/tuportal-internet/accederAplicacion.jspa?redireccion=57&idGrupo=55",
      { waitUntil: "networkidle0" }
    );
    //await page.waitForNavigation({ waitUntil: 'networkidle0' })
    console.log("Information: Configurando Datos Entrada yy/mm/dd");
    errorMsg = "Error al ingresar datos de fecha";

    await page.waitForSelector(`select[id="frmPrincipal:ano"]`, {
      timeout: 90000,
    });

    let successAnio = await pageSelect(
        page,
        `select[id="frmPrincipal:ano"]`,
        anio,
        0
      ),
      successMes = false,
      successDia = false;

    await page.waitForSelector(`select[id="frmPrincipal:mes"]`);

    if (successAnio) {
      successMes = await pageSelect(
        page,
        `select[id="frmPrincipal:mes"]`,
        mes,
        0
      );
    }

    await page.waitForSelector(`select[id="frmPrincipal:dia"]`);
    if (successMes) {
      successDia = await pageSelect(
        page,
        `select[id="frmPrincipal:dia"]`,
        dia,
        0
      );
    }
    if (!successAnio || !successMes || !successDia) throw new Error();
    console.log("Information: Solicitando ReCaptcha");

    let succesTipoComprobante = false;

    await page.waitForSelector(`select[id="frmPrincipal:cmbTipoComprobante"]`);

    if (successDia) {
      errorMsg = "Error al elegir el tipo de comprobante";
      succesTipoComprobante = await pageSelect(
        page,
        'select[id="frmPrincipal:cmbTipoComprobante"]',
        tipoComprobante,
        0
      );
    }

    if (succesTipoComprobante) {
      errorMsg = "Error al resolver captcha";
      await pageClick(page, "#btnRecaptcha", 3);
    }

    await delay(250);

    console.log("Information: Resolviendo ReCaptcha");
    await page.solveRecaptchas();

    await Promise.all([
      //page.waitForNavigation({ waitUntil: ['networkidle0'] }),
      page.evaluate(() => {
        let btn = document.getElementById("recaptcha-verify-button");
        if (btn != null) btn.click();
      }),
      // or page.addScriptTag({ content: 'window.location = 'https://example.com;' })
    ]);

    console.log("Information: Recaptcha resuelto");

    console.log("Information: Esperando datos");
    await delay(3000);

    // Proceso de paginación
    let hasNextPage = true;

    console.log("Information: Esperando datos");
    //await delay(2000);
    console.log("Information: Descargando Documentos");
    errorMsg = "Error al descargar documentos";

    // Mostrar el contenido de la página antes de hacer clic en el enlace
    //const pageContentDocument = await page.content();
    //console.log(pageContentDocument);

    // Verificar si existe el texto "No existen datos para los parámetros ingresados"
    /*const noDataText = await page.evaluate(() => {
              const warningElement = document.querySelector('.ui-messages-warn-summary');
              return warningElement && warningElement.textContent.includes("No existen datos para los parámetros ingresados");
          });*/

    //const pageContent = await page.content();

    // Verificar si el texto "No existen datos para los parámetros ingresados" está presente en el contenido de la página
    //const noDataText = pageContent.includes("No existen datos para los parámetros ingresados");

    // Intentar seleccionar el elemento del mensaje de advertencia
    // await delay(2000);
    // const warningElementHandle = await page.$(".ui-messages-warn-summary");

    // if (warningElementHandle) {
    //   // Obtener el contenido del elemento
    //   const noDataText = await page.evaluate(
    //     (el) => el.textContent,
    //     warningElementHandle
    //   );

    //   console.log(noDataText);

    //   if (noDataText.includes("No existen datos")) {
    //     console.log("Entro");
    //     if (page && !page.isClosed()) {
    //       //await page.close();
    //     }
    //     if (browser) {
    //       //await browser.close();
    //     }
    //     //await page.close();
    //     //await browser.close();
    //     //return "No existen datos para los parámetros ingresados";
    //     let retorno = {
    //       errorInfo: "No existen datos para los parámetros ingresados",
    //       errors: [],
    //     };
    //     res.json({ data: [], listError: retorno, status: true });
    //   }
    // }

    // if (noDataText) {
    //   let retorno = {
    //     errorInfo: "No existen datos para los parámetros ingresados",
    //     errors: [],
    //   };
    //   res.json({ data: [], listError: retorno });
    //   //return "No existen datos para los parámetros ingresados";
    // }

    await page.waitForSelector("#frmPrincipal\\:btnConsultar", {
      timeout: 70000,
    });
    await page.click("#frmPrincipal\\:btnConsultar");

    // Esperar hasta que la tabla esté disponible en el DOM
    await page.waitForSelector("#frmPrincipal\\:tablaCompRecibidos_data", {
      timeout: 70000,
    });

    await delay(100);
    const totalPages = await page.evaluate(() => {
      const text = document.querySelector(
        "span.ui-paginator-current"
      ).innerText;
      const paginas = text.replaceAll("(", "").replaceAll(")", "").split(" ");
      return paginas.length == 3 ? Number(paginas[2]) : 0;
    });
    let current = 0;
    let total = 0;

    console.log(totalPages);
    // Obtener todas las filas de la tabla
    const rows = await page.$$("#frmPrincipal\\:tablaCompRecibidos_data > tr");

    let nameNew = "";
    let nameFull = "";
    if (tipoComprobante == 1) {
      nameNew = "Factura";
      nameFull = "Factura";
    }

    if (tipoComprobante == 2) {
      nameNew = "Liquidacion Compra";
      nameFull = "Liquidacion_Compra";
    }

    if (tipoComprobante == 3) {
      nameNew = "Nota de_";
      nameFull = "Notas_de_Credito";
    }

    if (tipoComprobante == 4) {
      nameNew = "Nota de_";
      nameFull = "Notas_de_Debito";
    }

    if (tipoComprobante == 6) {
      nameNew = "Comprobante de_";
      nameFull = "Comprobante_de_Retencion";
    }

    const jsonFilePath01 = path.join(
      path.resolve("./downloads/" + ruc + "/" + anio + "_" + mes),
      "info.json"
    );
    let infoJson01 = [];

    if (fs.existsSync(jsonFilePath01)) {
      infoJson01 = JSON.parse(fs.readFileSync(jsonFilePath01, "utf8"));

      let jsonData = infoJson01.filter(
        (entry) => entry.xml !== "" && entry.pdf !== ""
      );

      // Guardar el archivo JSON actualizado
      fs.writeFile(
        jsonFilePath01,
        JSON.stringify(jsonData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error("Error al guardar el archivo JSON:", err);
            return;
          }
          console.log("Archivo JSON actualizado correctamente.");
        }
      );
    }

    // Iterar sobre cada fila y hacer clic en los enlaces de XML y PDF
    for (const [index, row] of rows.entries()) {
      // Obtener la clave de acceso de la fila
      const claveAccesoElement = await row.$("td:nth-child(4) div"); // Ajusta el selector según la posición correcta
      const claveAccesoText = await page.evaluate(
        (el) => el.textContent.trim(),
        claveAccesoElement
      );

      // Eliminar caracteres no permitidos en el nombre del archivo
      const sanitizedClaveAcceso = claveAccesoText.replace(
        /[/\\?%*:|"<>]/g,
        "_"
      );

      const tipoSerieElement = await row.$("td:nth-child(3) div");
      const tipoSerie = await page.evaluate(
        (el) => el.textContent.trim(),
        tipoSerieElement
      );
      const arrayTipoSerie = String(tipoSerie).split(" ");
      const serieComprobante = arrayTipoSerie[arrayTipoSerie.length - 1];

      const rucRazonSocialElement = await row.$("td:nth-child(2) div");
      const rucRazonSocial = await page.evaluate(
        (el) => el.textContent.trim(),
        rucRazonSocialElement
      );
      const arrayRucRazonSocial = String(rucRazonSocial)
        .split("\n")
        .map((item) => item.trim());
      const rucEmisor = arrayRucRazonSocial[0];
      const razonSocialEmisor = arrayRucRazonSocial[1];

      const fechaAutorizacionElement = await row.$("td:nth-child(5) div");
      const fechaAutorizacion = await page.evaluate(
        (el) => el.textContent.trim(),
        fechaAutorizacionElement
      );

      const fechaEmisionElement = await row.$("td:nth-child(6) div");
      const fechaEmision = await page.evaluate(
        (el) => el.textContent.trim(),
        fechaEmisionElement
      );

      const valorSinImpuestoElement = await row.$("td:nth-child(7) div");
      const valorSinImpuesto = await page.evaluate(
        (el) => el.textContent.trim(),
        valorSinImpuestoElement
      );

      const ivaElement = await row.$("td:nth-child(8) div");
      const iva = await page.evaluate(
        (el) => el.textContent.trim(),
        ivaElement
      );

      const importeTotalElement = await row.$("td:nth-child(9) div");
      const importeTotal = await page.evaluate(
        (el) => el.textContent.trim(),
        importeTotalElement
      );

      // Configura la carpeta de descargas
      const downloadPathRuc = path.resolve(
        "./downloads/" +
          ruc +
          "/" +
          anio +
          "_" +
          mes +
          "/" +
          sanitizedClaveAcceso
      );
      const downloadPathRucCurrent = path.resolve(
        "./downloads/" + ruc + "/" + anio + "_" + mes
      );
      if (!fs.existsSync(downloadPathRuc)) {
        fs.mkdirSync(downloadPathRuc, { recursive: true });
      }
      let newFilePathXml = "";
      let newFilePathPdf = "";
      let label = "";

      const jsonFilePath = path.join(downloadPathRucCurrent, "info.json");
      let infoJson = [];

      if (fs.existsSync(jsonFilePath)) {
        infoJson = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

        /*jsonData = jsonData.filter(entry => entry.xml !== '' && entry.pdf !== '');
  
                  // Guardar el archivo JSON actualizado
                  fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
                      if (err) {
                          console.error('Error al guardar el archivo JSON:', err);
                          return;
                      }
                      console.log('Archivo JSON actualizado correctamente.');
                  });
  
                  infoJson = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));*/
      }

      let findXml = infoJson.find(
        (f) => f.xml == `${sanitizedClaveAcceso}.xml`
      );
      let findPdf = infoJson.find(
        (f) => f.pdf == `${sanitizedClaveAcceso}.pdf`
      );

      // Hacer clic en el enlace XML
      const xmlLink = await row.$(
        'a[id^="frmPrincipal:tablaCompRecibidos:"][id$=":lnkXml"]'
      );
      if (xmlLink && findXml == null) {
        await xmlLink.click();
        console.log(
          `Descargando XML de la fila ${
            index + 1
          } con clave ${sanitizedClaveAcceso}`
        );
        await wait(5000); // Espera para asegurar la descarga

        // Renombrar el archivo XML después de la descarga
        const downloadedXmlFiles = fs
          .readdirSync(downloadPath)
          .filter((file) => file.endsWith(".xml"));
        if (downloadedXmlFiles.length > 0) {
          const oldFilePath = path.join(downloadPath, downloadedXmlFiles[0]);
          const newFilePath = path.join(
            downloadPathRuc,
            `${sanitizedClaveAcceso}.xml`
          );
          await rename(oldFilePath, newFilePath);
          newFilePathXml = `${sanitizedClaveAcceso}.xml`;
          console.log(`Archivo XML renombrado a: ${newFilePath}`);
        }

        console.log(`${downloadPath}/${nameNew}`);

        const downloadedXmlFiles01 = fs
          .readdirSync(downloadPath)
          .filter((file) => file.includes(nameNew));

        console.log("dx", downloadedXmlFiles01);

        if (downloadedXmlFiles01.length > 0) {
          const oldFilePath = path.join(downloadPath, downloadedXmlFiles01[0]);
          const newFilePath = path.join(
            downloadPathRuc,
            `${sanitizedClaveAcceso}.xml`
          );
          await rename(oldFilePath, newFilePath);
          newFilePathXml = `${sanitizedClaveAcceso}.xml`;
          console.log(`Archivo XML renombrado a: ${newFilePath}`);
        }
      }

      // Hacer clic en el enlace PDF
      const pdfLink = await row.$(
        'a[id^="frmPrincipal:tablaCompRecibidos:"][id$=":lnkPdf"]'
      );
      if (pdfLink && findPdf == null) {
        await pdfLink.click();
        console.log(
          `Descargando PDF de la fila ${
            index + 1
          } con clave ${sanitizedClaveAcceso}`
        );
        await wait(5000); // Espera para asegurar la descarga

        // Renombrar el archivo PDF después de la descarga
        const downloadedPdfFiles = fs
          .readdirSync(downloadPath)
          .filter((file) => file.endsWith(".pdf"));
        if (downloadedPdfFiles.length > 0) {
          const oldFilePath = path.join(downloadPath, downloadedPdfFiles[0]);
          const newFilePath = path.join(
            downloadPathRuc,
            `${sanitizedClaveAcceso}.pdf`
          );
          await rename(oldFilePath, newFilePath);
          newFilePathPdf = `${sanitizedClaveAcceso}.pdf`;
          console.log(`Archivo PDF renombrado a: ${newFilePath}`);
        }

        console.log(`${downloadPath}/'${nameNew}'`);

        // const downloadedPdfFiles01 = fs
        //   .readdirSync(downloadPath)
        //   .filter((file) => file.includes(nameNew));

        // console.log("dp", downloadedPdfFiles01);

        // if (downloadedPdfFiles01.length > 0) {
        //   const oldFilePath = path.join(downloadPath, downloadedPdfFiles01[0]);
        //   const newFilePath = path.join(
        //     downloadPathRuc,
        //     `${sanitizedClaveAcceso}.pdf`
        //   );
        //   await rename(oldFilePath, newFilePath);
        //   newFilePathPdf = `${sanitizedClaveAcceso}.pdf`;
        //   console.log(`Archivo PDF renombrado a: ${newFilePath}`);
        // }
      }
      if (findXml == null) {
        if (newFilePathXml != "" && newFilePathPdf != "") {
          let info = {
            xml: newFilePathXml,
            pdf: newFilePathPdf,
            tipoComprobante: tipoComprobante,
            rucEmisor: String(rucEmisor),
            razonSocialEmisor: String(razonSocialEmisor),
            claveAcceso: sanitizedClaveAcceso,
            serieComprobante: String(serieComprobante),
            fechaAutorizacion: String(fechaAutorizacion),
            fechaEmision: String(fechaEmision),
            valorSinImpuesto: valorSinImpuesto,
            iva: iva,
            importeTotal: importeTotal,
          };
          infoJson.push(info);
          data.push(info);
          fs.writeFileSync(
            jsonFilePath,
            JSON.stringify(infoJson, null, 2),
            "utf8"
          );
        }
      }
      //break;
    }
    //current++;
    let previous = 1;
    while (totalPages > current) {
      await page.evaluate(() => {
        const next = document.querySelector("span.ui-icon.ui-icon-seek-next");
        next.click();
      });

      current = await page.evaluate(() => {
        const text = document.querySelector(
          "span.ui-paginator-current"
        ).innerText;
        const paginas = text.replaceAll("(", "").replaceAll(")", "").split(" ");
        return paginas.length == 3 ? Number(paginas[0]) : 0;
      });
      console.log(` Pag ${current} de ${totalPages}`);

      if (current == previous) {
        await page.evaluate(() => {
          const next = document.querySelector("span.ui-icon.ui-icon-seek-next");
          next.click();
        });
        console.error({ error: "Error al cambiar de pÃ¡gina" });
        await delay(1000);
        //continue;
      } else {
        console.log("Se cambio de pÃ¡g con Ã©xito");
      }

      await page.waitForSelector("#frmPrincipal\\:tablaCompRecibidos_data", {
        timeout: 160000,
      });

      const rows = await page.$$(
        "#frmPrincipal\\:tablaCompRecibidos_data > tr"
      );

      console.log(current);
      //console.log(rows);

      // Iterar sobre cada fila y hacer clic en los enlaces de XML y PDF
      for (const [index, row] of rows.entries()) {
        let newFilePathXml = "";
        let newFilePathPdf = "";
        let label = "";

        // Obtener la clave de acceso de la fila
        const claveAccesoElement = await row.$("td:nth-child(4) div"); // Ajusta el selector según la posición correcta
        const claveAccesoText = await page.evaluate(
          (el) => el.textContent.trim(),
          claveAccesoElement
        );

        // Eliminar caracteres no permitidos en el nombre del archivo
        const sanitizedClaveAcceso = claveAccesoText.replace(
          /[/\\?%*:|"<>]/g,
          "_"
        );

        const tipoSerieElement = await row.$("td:nth-child(3) div");
        const tipoSerie = await page.evaluate(
          (el) => el.textContent.trim(),
          tipoSerieElement
        );
        const arrayTipoSerie = String(tipoSerie).split(" ");
        const serieComprobante = arrayTipoSerie[arrayTipoSerie.length - 1];

        const rucRazonSocialElement = await row.$("td:nth-child(2) div");
        const rucRazonSocial = await page.evaluate(
          (el) => el.textContent.trim(),
          rucRazonSocialElement
        );
        const arrayRucRazonSocial = String(rucRazonSocial)
          .split("\n")
          .map((item) => item.trim());
        const rucEmisor = arrayRucRazonSocial[0];
        const razonSocialEmisor = arrayRucRazonSocial[1];

        const fechaAutorizacionElement = await row.$("td:nth-child(5) div");
        const fechaAutorizacion = await page.evaluate(
          (el) => el.textContent.trim(),
          fechaAutorizacionElement
        );

        const fechaEmisionElement = await row.$("td:nth-child(6) div");
        const fechaEmision = await page.evaluate(
          (el) => el.textContent.trim(),
          fechaEmisionElement
        );

        const valorSinImpuestoElement = await row.$("td:nth-child(7) div");
        const valorSinImpuesto = await page.evaluate(
          (el) => el.textContent.trim(),
          valorSinImpuestoElement
        );

        const ivaElement = await row.$("td:nth-child(8) div");
        const iva = await page.evaluate(
          (el) => el.textContent.trim(),
          ivaElement
        );

        const importeTotalElement = await row.$("td:nth-child(9) div");
        const importeTotal = await page.evaluate(
          (el) => el.textContent.trim(),
          importeTotalElement
        );

        // Configura la carpeta de descargas
        const downloadPathRuc = path.resolve(
          "./downloads/" +
            ruc +
            "/" +
            anio +
            "_" +
            mes +
            "/" +
            sanitizedClaveAcceso
        );
        const downloadPathRucCurrent = path.resolve(
          "./downloads/" + ruc + "/" + anio + "_" + mes
        );
        if (!fs.existsSync(downloadPathRuc)) {
          fs.mkdirSync(downloadPathRuc, { recursive: true });
        }

        const jsonFilePath = path.join(downloadPathRucCurrent, "info.json");
        let infoJson = [];

        if (fs.existsSync(jsonFilePath)) {
          infoJson = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
        }

        let findXml = infoJson.find(
          (f) => f.xml == `${sanitizedClaveAcceso}.xml`
        );
        let findPdf = infoJson.find(
          (f) => f.pdf == `${sanitizedClaveAcceso}.pdf`
        );

        // Hacer clic en el enlace XML
        //const xmlLink = await row.$('a[id^="frmPrincipal:tablaCompRecibidos:"][id$=":lnkXml"]');
        //console.log('xmlLink',xmlLink);
        const xmlLinkSelector =
          'a[id^="frmPrincipal:tablaCompRecibidos:"][id$=":lnkXml"]';
        await page.waitForSelector(xmlLinkSelector, { visible: true });
        const xmlLink = await row.$(xmlLinkSelector);
        //await page.screenshot({ path: 'fullpage-screenshot.png', fullPage: true });
        if (xmlLink && findXml == null) {
          let retries = 3;
          while (retries > 0) {
            try {
              await xmlLink.click();
              break;
            } catch (err) {
              console.log("Elemento no disponible, reintentando...");
              retries--;
              await page.waitForTimeout(1000); // Espera 1 segundo antes de reintentar
            }
          }

          console.log(
            `Descargando XML de la fila ${
              index + 1
            } con clave ${sanitizedClaveAcceso}`
          );
          await wait(4000); // Espera para asegurar la descarga

          // Renombrar el archivo XML después de la descarga
          const downloadedXmlFiles = fs
            .readdirSync(downloadPath)
            .filter((file) => file.endsWith(".xml"));
          console.log("d", downloadedXmlFiles);
          if (downloadedXmlFiles.length > 0) {
            const oldFilePath = path.join(downloadPath, downloadedXmlFiles[0]);
            const newFilePath = path.join(
              downloadPathRuc,
              `${sanitizedClaveAcceso}.xml`
            );
            await rename(oldFilePath, newFilePath);
            newFilePathXml = `${sanitizedClaveAcceso}.xml`;
            console.log(`Archivo XML renombrado a: ${newFilePath}`);
          }

          console.log(`${downloadPath}/${nameNew}`);

          const downloadedXmlFiles01 = fs
            .readdirSync(downloadPath)
            .filter((file) => file.includes(nameNew));

          console.log("dx", downloadedXmlFiles01);

          //if(fs.existsSync(`${downloadPath}/${nameNew}`)){
          if (downloadedXmlFiles01.length > 0) {
            const oldFilePath = path.join(
              downloadPath,
              downloadedXmlFiles01[0]
            );
            const newFilePath = path.join(
              downloadPathRuc,
              `${sanitizedClaveAcceso}.xml`
            );
            await rename(oldFilePath, newFilePath);
            newFilePathXml = `${sanitizedClaveAcceso}.xml`;
            console.log(`Archivo XML renombrado a: ${newFilePath}`);
          }
        }

        // Hacer clic en el enlace PDF
        //const pdfLink = await row.$('a[id^="frmPrincipal:tablaCompRecibidos:"][id$=":lnkPdf"]');
        const pdfLinkSelector =
          'a[id^="frmPrincipal:tablaCompRecibidos:"][id$=":lnkPdf"]';
        await page.waitForSelector(pdfLinkSelector, { visible: true });
        const pdfLink = await row.$(pdfLinkSelector);
        if (pdfLink && findPdf == null) {
          let retries = 3;
          while (retries > 0) {
            try {
              await pdfLink.click();
              break;
            } catch (err) {
              console.log("Elemento no disponible, reintentando...");
              retries--;
              await page.waitForTimeout(1000); // Espera 1 segundo antes de reintentar
            }
          }

          console.log(
            `Descargando PDF de la fila ${
              index + 1
            } con clave ${sanitizedClaveAcceso}`
          );
          await wait(4000); // Espera para asegurar la descarga

          // Renombrar el archivo PDF después de la descarga
          const downloadedPdfFiles = fs
            .readdirSync(downloadPath)
            .filter((file) => file.endsWith(".pdf"));
          if (downloadedPdfFiles.length > 0) {
            const oldFilePath = path.join(downloadPath, downloadedPdfFiles[0]);
            const newFilePath = path.join(
              downloadPathRuc,
              `${sanitizedClaveAcceso}.pdf`
            );
            await rename(oldFilePath, newFilePath);
            newFilePathPdf = `${sanitizedClaveAcceso}.pdf`;
            console.log(`Archivo PDF renombrado a: ${newFilePath}`);
          }

          console.log(`${downloadPath}/${nameNew}`);

          const downloadedPdfFiles01 = fs
            .readdirSync(downloadPath)
            .filter((file) => file.includes(nameNew));

          console.log("dp", downloadedPdfFiles01);

          if (downloadedPdfFiles01.length > 0) {
            const oldFilePath = path.join(
              downloadPath,
              downloadedPdfFiles01[0]
            );
            const newFilePath = path.join(
              downloadPathRuc,
              `${sanitizedClaveAcceso}.pdf`
            );
            await rename(oldFilePath, newFilePath);
            newFilePathPdf = `${sanitizedClaveAcceso}.pdf`;
            console.log(`Archivo PDF renombrado a: ${newFilePath}`);
          }
        }

        if (findXml == null) {
          if (newFilePathXml != "" && newFilePathPdf != "") {
            let info = {
              xml: newFilePathXml,
              pdf: newFilePathPdf,
              tipoComprobante: tipoComprobante,
              claveAcceso: sanitizedClaveAcceso,
              rucEmisor: String(rucEmisor),
              razonSocialEmisor: String(razonSocialEmisor),
              claveAcceso: sanitizedClaveAcceso,
              serieComprobante: String(serieComprobante),
              fechaAutorizacion: String(fechaAutorizacion),
              fechaEmision: String(fechaEmision),
              valorSinImpuesto: valorSinImpuesto,
              iva: iva,
              importeTotal: importeTotal,
            };
            infoJson.push(info);
            data.push(info);
            fs.writeFileSync(
              jsonFilePath,
              JSON.stringify(infoJson, null, 2),
              "utf8"
            );
          }
        }

        //break;
      }

      previous++;
    }

    // Cierra el navegador
    if (browser) {
      await browser.close();
    }
    let retorno = data;
    return { data: retorno };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error("Error:", error);
    let retorno = { errorInfo: "Error al acceder", errors: error };
    return { data: [], listError: retorno, status: false };
  }
};
