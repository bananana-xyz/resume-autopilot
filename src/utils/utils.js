export const extractText = async (pdf) => {
    let extractedText = "";
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach(textItem => {
            extractedText += textItem.str + " ";
        });

        return extractedText;
    }
}