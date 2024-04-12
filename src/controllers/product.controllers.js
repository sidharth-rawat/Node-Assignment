import { StatusCodes } from "http-status-codes";
import { QuotationModel } from "../models/product.model.js";
import logger from "../config/logger/index.js";
import { QuotationValidation } from '../utils/schemaValidation.js';
import httpFormatter from "../utils/Formatter.js";
import {generatePDF} from '../utils/PDFGenerator.js'
// import pdf2pic from "pdf2pic";
import Config from '../config/index.js'

const { URL} = Config


export const createProduct = async (req, res) =>{
    try {
        let reqUser = req.user        

        const { error } = QuotationValidation.validate(req.body);

        if (error) {
        // Return bad request status with validation error message
            return res.status(StatusCodes.BAD_REQUEST).json(httpFormatter({}, error.message, false));
        }

        // Compute GST for each product (18%)
        const productsWithGST = req.body.products.map(product => ({
            ...product,
            gst: product.rate * 0.18 // Computing GST as 18% of the product rate
        }));

        // Create new quotation instance
        const quotation = new QuotationModel({
            userId: reqUser?.id, // Assuming user ID is available in request after authentication
            products: productsWithGST // Using products with computed GST
        });

        await quotation.save();

        // Save quotation to the database
        const pdfFileName = await generatePDF(quotation.products);
    const pdfURL = `${URL}/pdf/${pdfFileName}`;


        // Return success response with created quotation
        return res.status(StatusCodes.CREATED).json(httpFormatter(pdfURL, "Quotation created successfully", true));


    } catch (error) {
        console.log(error);
        logger.error(`Error in Login: ${error}`);
        // Return internal server error status with error message
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(httpFormatter({}, "Something went wrong!", false));

    }
}
export const getAllUser = async (req, res) => {
    try {
        let reqUser = req.user;
        const data = await QuotationModel.find({ userId: reqUser.id }).select('-updatedAt -createdAt -userId');
        
        // Loop through each quotation and generate PDF URL
        for (let quotation of data) {
            const pdfFileName = await generatePDF(quotation.products);
            quotation.pdfUrl = `${URL}/pdf/${pdfFileName}`;
        }

        if (data.length === 0) {
            return res.status(StatusCodes.OK).json(httpFormatter({}, "No Data found"));
        }
const formattedData =data.map(item => ({
    ...item.toObject(), // Convert Mongoose document to plain JavaScript object
    pdfUrl: item.pdfUrl // Add the pdfUrl field
}))

        return res.status(StatusCodes.OK).json(httpFormatter(formattedData,"Data found successfully!", true));

    } catch (error) {
        console.log(error);
        logger.error(`Error in Login: ${error}`);
        // Return internal server error status with error message
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(httpFormatter({}, "Something went wrong!", false));
    }
}
