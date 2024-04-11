import { StatusCodes } from "http-status-codes";
import { UserModel } from "../models/user.model.js";
import logger from "../config/logger/index.js";
import { createJWT } from "../utils/token.js";
import { RegistrationValidation,LoginValidation } from '../utils/schemaValidation.js';
import bcrypt from 'bcrypt'
import httpFormatter from "../utils/Formatter.js";

export const Register = async (req, res) => {
    try {
        // Extracting data from request body
        const { name, email, password, confirmPassword } = req.body;

        // Checking if all required fields are provided
        if (!name || !email || !password || !confirmPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json(httpFormatter({}, "All Field Required!", false));

        }

        // Checking if password and confirm password match
        if (password !== confirmPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json(httpFormatter({}, "Password and Confirm Password must be the same!", false));

        }
        // Validating user input against schema
        const { error, value } = RegistrationValidation.validate({ name, email, password });

        // If validation fails, throw an error
        if (error) {
            return res.status(StatusCodes.BAD_REQUEST).json(httpFormatter({}, error.message, false));

        }

        // Destructure validated values from schema validation result
        const { name: validatedName, email: validatedEmail, password: validatedPassword } = value;

        // Check if user with given email already exists
        const alreadyExisting = await UserModel.findOne({ email: validatedEmail });

        // If user already exists, return conflict status
        if (alreadyExisting) {
            return res.status(StatusCodes.CONFLICT).json(httpFormatter({}, "User already exists!", false));
        }

        // Create new user in the database

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(validatedPassword, salt);


        await UserModel.create({ name: validatedName, email: validatedEmail, password: hashedPassword });

        // Return success response with created user data
        return res.status(StatusCodes.CREATED).json(httpFormatter({}, "Registration successfully"));

    } catch (error) {
        // Log error
        logger.error(`Error in Register: ${error}`);
        // Return internal server error status with error message
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(httpFormatter({}, "Something went wrong!", false));
    }
};




export const login = async (req, res) => {
    try {
        // Extracting data from request body
        const { email, password } = req.body;

        // Checking if all required fields are provided
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json(httpFormatter({}, "All fields required!", false));
        }
        // Validating user input against schema
        const { error, value } = LoginValidation.validate({ email, password });

        // If validation fails, return a bad request response with the validation error message
                // If validation fails, return a bad request response with the validation error message
                if (error) {
                    return res.status(StatusCodes.BAD_REQUEST).json(httpFormatter({}, error.message, false));
                }


        // Destructure validated values from schema validation result
        const { email: validatedEmail, password: validatedPassword } = value;

        // Find user by email
        const user = await UserModel.findOne({ email: validatedEmail });

        // If user not found, return unauthorized response
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json(httpFormatter({}, "Invalid email or password!", false));
        }

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(validatedPassword, user.password);

        // If password is not valid, return unauthorized response
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json(httpFormatter({}, "Invalid email or password!", false));
        }
        // If email and password are valid, create JWT token for user
        const token = createJWT({id:user._id, name: user.name,email: user.email});
        // Return success response with JWT token
        return res.status(StatusCodes.OK).json(httpFormatter({ token }, "Login successful"));

    } catch (error) {
        // Log error
        logger.error(`Error in Login: ${error}`);
        // Return internal server error status with error message
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(httpFormatter({}, "Something went wrong!", false));
    }
};
