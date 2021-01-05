import React from 'react';
import { NativeModules } from 'react-native';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as RNFS from "react-native-fs";
import { PermissionsAndroid, Image, FileReader, Platform } from "react-native";
import { generateQR } from "./qrUtils";
import FileViewer from 'react-native-file-viewer';

const reasonsPDF = [
  {text: "travail", y: 553}, // Between home and work
  {text: "achats", y: 482}, // Need furnitures
  {text: "sante", y: 434}, // Exams and medic appointments
  {text: "famille", y: 410}, // Family iusses
  {text: "handicap", y : 373}, // Move out because of handicap reasons
  {text: "sport_animaux", y: 349}, // Move out
  {text: "convocation", y: 276}, // Has to go to justice
  {text: "missions", y: 252}, // Work asked by government
  {text: "enfants", y: 228}, // Get chilrens to school
];

const qrTitle1 = 'QR-code contenant les informations ';
const qrTitle2 = 'de votre attestation numérique';

export const createPDFFile = async (profile, time, day) => {
  const currentDate = new Date();
  const creationDate = currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + "/" + currentDate.getFullYear();
  const creationHour = currentDate
    .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    .replace(':', 'h');
  const existingPdfBytes = await RNFS.readFileAssets("certificate.pdf", "base64");
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // set pdf metadata
  pdfDoc.setTitle('COVID-19 - Déclaration de déplacement');
  pdfDoc.setSubject('Attestation de déplacement dérogatoire');
  pdfDoc.setKeywords([
    'covid19',
    'covid-19',
    'attestation',
    'déclaration',
    'déplacement',
    'officielle',
    'gouvernement',
  ]);
  pdfDoc.setProducer('DNUM/SDIT');
  pdfDoc.setCreator('William GAUDFRIN, édité depuis l\'attestation dérogatoire officielle.');
  pdfDoc.setAuthor("Ministère de l'intérieur");

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const drawText = (text, x, y, size = 11) => {
    firstPage.drawText(text, { x, y, size, helveticaFont });
  };

  drawText(`${profile['name.first']} ${profile['name.last']}`, 92, 702);
  drawText(profile['birth.day'], 92, 684);
  drawText(profile['birth.place'], 214, 684);
  drawText(`${profile['home.street']} ${profile['home.zipcode']} ${profile['home.city']}`, 104, 665);
  drawText(profile['home.city'], 78, 76);
  drawText(day, 63, 58);
  drawText(time, 227, 58);
  let reasonsString = "";
  profile['reasons'].forEach(index => {
    reasonsString += reasonsPDF[index].text + ", ";
    drawText('x', 47, reasonsPDF[index].y, 12);
  });

  reasonsString = reasonsString.substring(0, reasonsString.length - 2);
  // const generatedQR = await generateQR([
  //   `Cree le: ${creationDate} a ${creationHour}`,
  //   `Nom: ${name.last}`,
  //   `Prenom: ${name.first}`,
  //   `Naissance: ${birth.day} a ${birth.place}`,
  //   `Adresse: ${home.street} ${home.zipcode} ${home.city}`,
  //   `Sortie: ${time.day} a ${time.time}`,
  //   `Motifs: ${reasonsString}`
  // ].join(';\n'));
  // const qrImage = await pdfDoc.embedPng(generatedQR);

  // firstPage.drawText(
  //   qrTitle1 + '\n' + qrTitle2,
  //   {
  //     x: 415,
  //     y: 135,
  //     size: 9,
  //     helveticaFont,
  //     lineHeight: 10,
  //     color: rgb(1, 1, 1)
  //   }
  // );

  // firstPage.drawImage(qrImage, {
  //   x: firstPage.getWidth() - 156,
  //   y: 25,
  //   width: 92,
  //   height: 92
  // });

  // pdfDoc.addPage();

  // secondPage = pages[1];

  // secondPage.drawText(
  //   qrTitle1 + qrTitle2,
  //   {
  //     x: 50,
  //     y: secondPage.getHeight() - 70,
  //     size: 11,
  //     helveticaFont,
  //     color: rgb(1, 1, 1)
  //   }
  // );

  // secondPage.drawImage(qrImage,
  //   {
  //     x: 50,
  //     y: secondPage.getHeight() - 390,
  //     width: 300,
  //     height: 300
  //   }
  // );

  const pdfDataUri = await pdfDoc.saveAsBase64();
  let timeHours = time.split(':').join('h');
  let filename = "attestation-" + timeHours +  "_" + day.split('/').join('-') + ".pdf";
  await RNFS.writeFile(RNFS.ExternalStorageDirectoryPath + "/documents/" + filename, pdfDataUri, 'base64');

  return ({success: true, data: { title: filename, day: day, time: timeHours }});
}

export const createPDF = async (profile, time, day) => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED)
          return (createPDFFile(profile, time, day));
        else
          return {error: true, message: "Permission denied"};
      } catch (err) {
        console.warn(err);
      }
    } else
      return {error: true, message: "Permission denied"};
  } catch (err) {
      console.warn(err);
  }
}

export const openPDF = async (filename) => {
  const dest = `${RNFS.ExternalStorageDirectoryPath}/documents/${filename}`;

  FileViewer.open(dest)
  .then(() => {
    return {success: true};
  }).catch(error => {
    return {error: true};
  })
}