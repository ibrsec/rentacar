"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Token } = require("../models/tokenModel");
const { User } = require("../models/userModel");

module.exports.token = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Tokens"]
            #swagger.summary = "List Tokens"
            #swagger.description = `
                You can send query with endpoint for filter[],search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            
            `
        */
    const tokens = await res.getModelList(Token);
    res.status(200).json({
      error: false,
      message: "Tokens are listed!",
      details: await res.getModelListDetails(Token),
      result: tokens,
    });
  },
  create: async (req, res) => {
    /*
        #swagger.tags = ["Tokens"]
        #swagger.summary = "Create new token"
        #swagger.description = "Create a new token!!"
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { 
                $userId: '66b1eacece90856636455955',
                $token: '2ba29981b016f7cbf62faf15e3cb256c1104b9f9c5323c37'
            }
        }
        #swagger.responses[201] = {
            description: 'Added a new token...',
            schema: { 
                error: false,
                message: "Token is created!",
                result:{$ref: '#/definitions/Token'} 
            }

        }  
        #swagger.responses[400] = {
            description: 'Bad Request </br>- tokenname,email and password fields are required! </br>- Invalid userId type (object id)!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'User not found on Users!',
            schema: { $ref: '#/definitions/Error' }

        }



     */
    const { userId, token } = req.body;
    if (!userId || !token) {
      throw new CustomError("userId and token fields are required!", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid userId type (object id)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("User not found on Users!", 404);
    }

    const newToken = await Token.create(req.body);

    res.status(201).json({
      error: false,
      message: "Token is created!",
      result: newToken,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Tokens"]
            #swagger.summary = "Get a token"
            #swagger.description = "Get a token by id!!"
            #swagger.responses[200] = {
                description: 'Added a new token...',
                schema: [{ $ref: '#/definitions/Token' }]
            }   
            #swagger.responses[400] = {
                description: 'Bad Request invalid id',
                schema: { $ref: '#/definitions/Error' }

            }
            #swagger.responses[404] = {
                description: 'Token not found!',
                schema: { $ref: '#/definitions/Error' }

            }
    
    */
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid id (objectId )type!");
    }
    const token = await Token.findOne({ _id: req.params.id });
    if (!token) {
      throw new CustomError("Token not found!", 404);
    }
    res.status(200).json({
      error: false,
      message: "Token is found!",
      result: token,
    });
  },
  update: async (req, res) => {
    /*
        #swagger.tags = ["Tokens"]
        #swagger.summary = "Update a token"
        #swagger.description = "Update a token by id!!"
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { 
                $userId: '66b1eacece90856636455955',
                $token: '2ba29981b016f7cbf62faf15e3cb256c1104b9f9c5323c37'
            }
        }
        #swagger.responses[202] = {
            description: 'Update is successfull!',
            schema: { 
                error: false,
                message: "Token is updated!",
                result:{$ref: '#/definitions/Token'} 
            }

        }  
        #swagger.responses[400] = {
                description: 'Bad Request </br>- invalid id type!</br>- tokenname,email and password fields are required!',
                schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'Not Found</br>- Token not found!</br>- User not found on Users!',
            schema: { $ref: '#/definitions/Error' }

        }
        
        #swagger.responses[500] = {
            description: 'Something went wrong - token found on db but it couldn\'t be updated!',
            schema: { $ref: '#/definitions/Error' }

        }


     */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type (object id)!", 400);
    }

    const { userId, token } = req.body;
    if (!userId || !token) {
      throw new CustomError("userId token fields are required!", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid userId type (object id)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("User not found on Users!", 404);
    }

    const tokenData = await Token.findOne({ _id: req.params.id });
    if (!tokenData) {
      throw new CustomError("Token not found!", 404);
    }

    const { modifiedCount } = await Token.updateOne(
      { _id: req.params.id },
      req.body,
      { runValidators: true }
    );
    if (modifiedCount < 1) {
      throw new CustomError(
        "Something went wrong - issue at the end of the process!",
        500
      );
    }

    res.status(202).json({
      error: false,
      message: "Token is updated!",
      result: await Token.findOne({ _id: req.params.id }),
    });
  },
  patchUpdate: async (req, res) => {
    /*
        #swagger.tags = ["Tokens"]
        #swagger.summary = "Partially Update a token"
        #swagger.description = "Partially Update a token by id!! Provide at least one field!"
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { 
                userId: '66b1eacece90856636455955',
                token: '2ba29981b016f7cbf62faf15e3cb256c1104b9f9c5323c37'
            
            }
        }
        #swagger.responses[202] = {
            description: 'Partially update is successfull!',
            schema: { 
                error: false,
                message: "Token is partially updated!",
                result:{$ref: '#/definitions/Token'} 
            }

        }  
        #swagger.responses[400] = {
                description: 'Bad Request </br>- invalid id type!</br>- at least one field is required!',
                schema: { $ref: '#/definitions/Error' }

        } 
        #swagger.responses[404] = {
            description: 'Not Found</br>- Token not found!</br>- User not found on Users!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[500] = {
            description: 'Something went wrong - token found on db but it couldn\'t be updated!',
            schema: { $ref: '#/definitions/Error' }

        }


     */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type (object id)!", 400);
    }
    const { userId, token } = req.body;
    if (!(userId || token)) {
      throw new CustomError(
        "At least one field is required - userId, token",
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid userId type (object id)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("User not found on Users!", 404);
    }

    const tokenData = await Token.findOne({ _id: req.params.id });
    if (!tokenData) {
      throw new CustomError("Token not found!", 404);
    }

    const { modifiedCount } = await Token.updateOne(
      { _id: req.params.id },
      req.body,
      { runValidators: true }
    );
    if (modifiedCount < 1) {
      throw new CustomError(
        "Something went wrong - issue at the end of the process!",
        500
      );
    }

    res.status(202).json({
      error: false,
      message: "Token is partially updated!",
      result: await Token.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
        #swagger.tags = ["Tokens"]
        #swagger.summary = "Delete a token"
        #swagger.description = "Delete a token by id!"
        
        #swagger.responses[204] = {
            description: 'Token is deleted successfully!',
            
        }  
        #swagger.responses[400] = {
                description: 'Bad Request - invalid id type!',
                schema: { $ref: '#/definitions/Error' }

        } 
        #swagger.responses[404] = {
            description: 'Token not found!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[500] = {
            description: 'Something went wrong - token found on db but it couldn\'t be updated!',
            schema: { $ref: '#/definitions/Error' }

        }


     */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id(object id) type!", 400);
    }

    const token = await Token.findOne({ _id: req.params.id });
    if (!token) {
      throw new CustomError("Token not found!", 404);
    }

    const { deletedCount } = await Token.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong - issue at the end of the process!!",
        500
      );
    }

    res.sendStatus(204);
  },
};
