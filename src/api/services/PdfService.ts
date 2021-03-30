import ejs from 'ejs';
export class PDFService {

    public static renderFile(orderData: any, results: any): Promise<any> {
        return new Promise(async (resolve: any, reject: any) => {
            ejs.renderFile('./views/invoice.ejs', { orderData, results }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public static pdfFile(orderData: any): Promise<any> {
        return new Promise(async (resolve: any, reject: any) => {
            const pdf = require('html-pdf');
            pdf.create(orderData).toBuffer(async (error: any, Buffer: any) => {
                if (error) {
                    reject(error);
                } else {
                    const base64 = 'data:application/pdf;base64,' + Buffer.toString('base64');
                    resolve(base64);
                }
            });
        });
    }
}
