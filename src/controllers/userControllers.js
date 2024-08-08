"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { User } = require("../models/userModel");

module.exports.user = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "List Users"
            #swagger.description = `
                Permission: <b>Loginned user</b></br> - user can access own user only</br> - admin can access all users</br></br>
                Token endpoint is hidden </br></br>
                You can send query with endpoint for filter[],search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            
            `
        */
    const customfilters = {};
    if (!req.user.isAdmin) {
      customfilters._id = req.user?.userId;
    }

    const users = await res.getModelList(User, customfilters);
    res.status(200).json({
      error: false,
      message: "Users are listed!",
      details: await res.getModelListDetails(User, customfilters),
      result: users,
    });
  },
  create: async (req, res) => {
    /*
        #swagger.tags = ["Users"]
        #swagger.summary = "Create new user"
        #swagger.description = `Create a new user!!
                  </br> - Password type Rules- [lenght:8-16, at least: 1 upper, 1 lower, 1 number, 1 special[@$!%*?&]]"
                  </br> - Just an Admin can create admin, staff or inActive users`
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { 
                $username: 'testuser',
                $email: 'test@test.com',
                $password: 'Password1?',
                firstName: 'firstname',
                lastName: 'lastname',
                isActive:'true',
                isStaff:'false',
                isAdmin:'false'
            
            }
        }
        #swagger.responses[201] = {
            description: 'Added a new user...',
            schema: { 
                error: false,
                message: "User is created!",
                result:{$ref: '#/definitions/User'} 
            }

        }  
        #swagger.responses[400] = {
            description: 'Bad Request - username,email and password fields are required!',
            schema: { $ref: '#/definitions/Error' }

        }



     */
    const {
      username,
      password,
      email,
      firstName,
      lastName,
      isActive,
      isAdmin,
      isStaff,
    } = req.body;
    if (!username || !email || !password) {
      throw new CustomError(
        "username,email and password fields are required!",
        400
      );
    }

    //user level manage
    req.body.isAdmin = false;
    req.body.isStaff = false;
    req.body.isActive = true;
    if (req?.user?.isAdmin) {
      if (isAdmin === true) {
        req.body.isAdmin = true;
      }
      if (isStaff === true) {
        req.body.isStaff = true;
      }
      if (isActive === false) {
        req.body.isActive = false;
      }
    }

    const newUser = await User.create(req.body);

    res.status(201).json({
      error: false,
      message: "User is created!",
      result: newUser,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Users"]
            #swagger.summary = "Get a user"
            #swagger.description = ` Permission: <b>Loginned user</b></br> - user can access own user only</br> - admin can access all users</br></br>Get a user by id!!`
            #swagger.responses[200] = {
                description: 'Added a new user...',
                schema: [{ $ref: '#/definitions/User' }]
            }   
            #swagger.responses[400] = {
                description: 'Bad Request invalid id...',
                schema: { $ref: '#/definitions/Error' }

            }
            #swagger.responses[404] = {
                description: 'User not found!',
                schema: { $ref: '#/definitions/Error' }

            }
    
    */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid objectId type!");
    }
    const user = await User.findOne({
      _id: req.user.isAdmin === true ? req.params.id : req.user?.userId,
    });
    if (!user) {
      throw new CustomError("User not found!", 404);
    }
    res.status(200).json({
      error: false,
      message:
        req.user.isAdmin === true
          ? "User is found!"
          : "User can't list the other users! Your user info is here!",
      result: user,
    });
  },
  update: async (req, res) => {
    /*
        #swagger.tags = ["Users"]
        #swagger.summary = "Update a user"
        #swagger.description = "Permission: <b>Admin or Staff user</b></br>- Staff users cant change admin status of a user!</br></br>Update a user by id!!"
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { 
                $username: 'testuser',
                $email: 'test@test.com',
                $password: 'Password1?',
                firstName: 'firstname',
                lastName: 'lastname',
                isActive:'true',
                isStaff:'false',
                isAdmin:'false'
            
            }
        }
        #swagger.responses[202] = {
            description: 'Update is successfull!',
            schema: { 
                error: false,
                message: "User is updated!",
                result:{$ref: '#/definitions/User'} 
            }

        }  
        #swagger.responses[400] = {
                description: 'Bad Request - invalid id...',
                schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[400] = {
            description: 'Bad Request - username,email and password fields are required!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'User not found!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[500] = {
            description: 'Something went wrong - user found on db but it couldn\'t be updated!',
            schema: { $ref: '#/definitions/Error' }

        }


     */
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid objectId type!");
    }

    const {
      username,
      password,
      email,
      firstName,
      lastName,
      isActive,
      isAdmin,
      isStaff,
    } = req.body;
    if (!username || !email || !password) {
      throw new CustomError(
        "username,email and password fields are required!",
        400
      );
    }

    //if staff user try to change isAdmin of a user
    if (isAdmin === true) {
      if(!req.user?.isAdmin){
        delete req.body.isAdmin
      }
    }
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    const { modifiedCount } = await User.updateOne(
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
      message: "User is updated!",
      result: await User.findOne({ _id: req.params.id }),
    });
  },
  patchUpdate: async (req, res) => {
    /*
        #swagger.tags = ["Users"]
        #swagger.summary = "Partially Update a user"
        #swagger.description = "Permission: <b>Admin or Staff user</b></br>- Staff users cant change admin status of a user!</br</br>Partially Update a user by id!! Provide at least one field!"
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { 
                username: 'testuser',
                email: 'test@test.com',
                password: 'Password1?',
                firstName: 'firstname',
                lastName: 'lastname',
                isActive:'true',
                isStaff:'false',
                isAdmin:'false'
            
            }
        }
        #swagger.responses[202] = {
            description: 'Partially update is successfull!',
            schema: { 
                error: false,
                message: "User is partially updated!",
                result:{$ref: '#/definitions/User'} 
            }

        }  
        #swagger.responses[400] = {
                description: 'Bad Request - invalid id...',
                schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[400] = {
            description: 'Bad Request - at least one field is required!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'User not found!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[500] = {
            description: 'Something went wrong - user found on db but it couldn\'t be updated!',
            schema: { $ref: '#/definitions/Error' }

        }


     */
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid objectId type!");
    }

    const {
      username,
      password,
      email,
      firstName,
      lastName,
      isActive,
      isAdmin,
      isStaff,
    } = req.body;
    if (
      !(
        username ||
        email ||
        password ||
        firstName ||
        lastName ||
        isActive ||
        isStaff ||
        isAdmin
      )
    ) {
      throw new CustomError(
        "At least one field is required - username, password, email, firstName, lastName, isActive, isAdmin, isStaff",
        400
      );
    }

    //if staff user try to change isAdmin of a user
    if (isAdmin === true) {
      if(!req.user?.isAdmin){
        delete req.body.isAdmin
      }
    }


    
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    const { modifiedCount } = await User.updateOne(
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
      message: "User is partially updated!",
      result: await User.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
        #swagger.tags = ["Users"]
        #swagger.summary = "Delete a user"
        #swagger.description = "Permission: <b>Admin user</b></br></br>Delete a user by id!"
        
        #swagger.responses[204] = {
            description: 'User is deleted successfully!',
            
        }  
        #swagger.responses[400] = {
                description: 'Bad Request - invalid id!',
                schema: { $ref: '#/definitions/Error' }

        } 
        #swagger.responses[404] = {
            description: 'User not found!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[500] = {
            description: 'Something went wrong - user found on db but it couldn\'t be updated!',
            schema: { $ref: '#/definitions/Error' }

        }


     */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid objectId type!", 400);
    }

    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    const { deletedCount } = await User.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong - issue at the end of the process!!",
        500
      );
    }

    res.sendStatus(204);
  },
};
