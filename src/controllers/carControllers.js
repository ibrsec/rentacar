"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Car } = require("../models/carModel");
const { User } = require("../models/userModel");

module.exports.car = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Cars"]
            #swagger.summary = "List Cars"
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
    const cars = await res.getModelList(Car);
    res.status(200).json({
      error: false,
      message: "Cars are listed!",
      details: await res.getModelListDetails(Car),
      result: cars,
    });
  },
  create: async (req, res) => {
    /*
        #swagger.tags = ["Cars"]
        #swagger.summary = "Create new car"
        #swagger.description = "Create a new car!!</br>- year must be between min 2000 to max current year"
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { 
                $plateNumber: '10ua4345',
                $brand: 'Toyota',
                $model: 'Corolla',
                $year: 2020,
                $pricePerDay: 200,
                $createdId: '66b1eacece90856636455955',
                $updatedId: '56b1erfehe90856633456786',
                isAvaliable:true,
                images: ['img1','img2'],
                isAutomatic:false
            }
        }
        #swagger.responses[201] = {
            description: 'Added a new car...',
            schema: { 
                error: false,
                message: "Car is created!",
                result:{$ref: '#/definitions/Car'} 
            }

        }  
        #swagger.responses[400] = {
            description: 'Bad Request </br>- plateNumber, brand, model, year, pricePerDay, createdId, updatedId fields are required! </br>- Invalid createdId, updatedId type (object id)!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'createdId or updatedId not found on Users!',
            schema: { $ref: '#/definitions/Error' }

        }



     */
    const {
      plateNumber,
      brand,
      model,
      year,
      isAutomatic,
      pricePerDay,
      isAvaliable,
      images,
      createdId,
      updatedId,
    } = req.body;
    if (
      !plateNumber ||
      !brand ||
      !model ||
      !year ||
      !pricePerDay ||
      !createdId ||
      !updatedId
    ) {
      throw new CustomError(
        "plateNumber, brand, model, year, pricePerDay, createdId, updatedId fields are required!",
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(createdId)) {
      throw new CustomError("Invalid createdId type (object id)!", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(updatedId)) {
      throw new CustomError("Invalid updatedId type (object id)!", 400);
    }

    const userCreated = await User.findOne({ _id: createdId });
    if (!userCreated) {
      throw new CustomError("createdId not found on Users!", 404);
    }
    const userUpdated = await User.findOne({ _id: updatedId });
    if (!userUpdated) {
      throw new CustomError("updatedId not found on Users!", 404);
    }

    const newCar = await Car.create(req.body);

    res.status(201).json({
      error: false,
      message: "Car is created!",
      result: newCar,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Cars"]
            #swagger.summary = "Get a car"
            #swagger.description = "Get a car by id!!"
            #swagger.responses[200] = {
                description: 'Added a new car...',
                schema: [{ $ref: '#/definitions/Car' }]
            }   
            #swagger.responses[400] = {
                description: 'Bad Request invalid id',
                schema: { $ref: '#/definitions/Error' }

            }
            #swagger.responses[404] = {
                description: 'Car not found!',
                schema: { $ref: '#/definitions/Error' }

            }
    
    */
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid id (objectId )type!");
    }
    const car = await Car.findOne({ _id: req.params.id });
    if (!car) {
      throw new CustomError("Car not found!", 404);
    }
    res.status(200).json({
      error: false,
      message: "Car is found!",
      result: car,
    });
  },
  update: async (req, res) => {
    /*
        #swagger.tags = ["Cars"]
        #swagger.summary = "Update a car"
        #swagger.description = "Update a car by id!!"
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { 
               $plateNumber: '10ua4345',
                $brand: 'Toyota',
                $model: 'Corolla',
                $year: 2020,
                $pricePerDay: 200,
                $createdId: '66b1eacece90856636455955',
                $updatedId: '56b1erfehe90856633456786',
                isAvaliable:true,
                images: ['img1','img2'],
                isAutomatic:false
            }
        }
        #swagger.responses[202] = {
            description: 'Update is successfull!',
            schema: { 
                error: false,
                message: "Car is updated!",
                result:{$ref: '#/definitions/Car'} 
            }

        }  
        #swagger.responses[400] = {
            description: 'Bad Request </br>- plateNumber, brand, model, year, pricePerDay, createdId, updatedId fields are required! </br>- Invalid id, createdId, updatedId type (object id)!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'Not Found</br>- createdId or updatedId not found on Users!</br>- Car not found!',
            schema: { $ref: '#/definitions/Error' }

        }
        
        #swagger.responses[500] = {
            description: 'Something went wrong - car found on db but it couldn\'t be updated!',
            schema: { $ref: '#/definitions/Error' }

        }


     */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type (object id)!", 400);
    }

    const {
      plateNumber,
      brand,
      model,
      year,
      isAutomatic,
      pricePerDay,
      createdId,
      updatedId,
    } = req.body;
    if (
      !plateNumber ||
      !brand ||
      !model ||
      !year ||
      !pricePerDay ||
      !createdId ||
      !updatedId
    ) {
      throw new CustomError(
        "plateNumber, brand, model, year, pricePerDay, createdId, updatedId fields are required!",
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(createdId)) {
      throw new CustomError("Invalid createdId type (object id)!", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(updatedId)) {
      throw new CustomError("Invalid updatedId type (object id)!", 400);
    }

    const userCreated = await User.findOne({ _id: createdId });
    if (!userCreated) {
      throw new CustomError("createdId not found on Users!", 404);
    }
    const userUpdated = await User.findOne({ _id: updatedId });
    if (!userUpdated) {
      throw new CustomError("updatedId not found on Users!", 404);
    }

    //////////
    const carData = await Car.findOne({ _id: req.params.id });
    if (!carData) {
      throw new CustomError("Car not found!", 404);
    }

    const { modifiedCount } = await Car.updateOne(
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
      message: "Car is updated!",
      result: await Car.findOne({ _id: req.params.id }),
    });
  },
  patchUpdate: async (req, res) => {
    /*
        #swagger.tags = ["Cars"]
        #swagger.summary = "Partially Update a car"
        #swagger.description = "Partially Update a car by id!! Provide at least one field!"
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: { 
                plateNumber: '10ua4345',
                brand: 'Toyota',
                model: 'Corolla',
                year: 2020,
                pricePerDay: 200,
                createdId: '66b1eacece90856636455955',
                updatedId: '56b1erfehe90856633456786',
                isAvaliable:true,
                images: ['img1','img2'],
                isAutomatic:false
            
            }
        }
        #swagger.responses[202] = {
            description: 'Partially update is successfull!',
            schema: { 
                error: false,
                message: "Car is partially updated!",
                result:{$ref: '#/definitions/Car'} 
            }

        }  
        #swagger.responses[400] = {
            description: 'Bad Request </br>- At least on field is required! - plateNumber, brand, model, year, isAutomatic, pricePerDay, createdId, updatedId! </br>- Invalid id, createdId, updatedId type (object id)!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'Not Found</br>- createdId or updatedId not found on Users!</br>- Car not found!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[500] = {
            description: 'Something went wrong - car found on db but it couldn\'t be updated!',
            schema: { $ref: '#/definitions/Error' }

        }


     */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id type (object id)!", 400);
    }

    const {
      plateNumber,
      brand,
      model,
      year,
      isAutomatic,
      pricePerDay,
      isAvaliable,
      images,
      createdId,
      updatedId,
    } = req.body;
    if (
      !(
        plateNumber ||
        brand ||
        model ||
        year ||
        pricePerDay ||
        createdId ||
        updatedId ||
        isAutomatic ||
        images ||
        isAvaliable
      )
    ) {
      throw new CustomError(
        "At least on field is required! - plateNumber, brand, model, year, isAutomatic, pricePerDay, createdId, updatedId",
        400
      );
    }

    if (createdId) {
      if (!mongoose.Types.ObjectId.isValid(createdId)) {
        throw new CustomError("Invalid createdId type (object id)!", 400);
      }

      const userCreated = await User.findOne({ _id: createdId });
      if (!userCreated) {
        throw new CustomError("createdId not found on Users!", 404);
      }
    }
    if (updatedId) {
      if (!mongoose.Types.ObjectId.isValid(updatedId)) {
        throw new CustomError("Invalid updatedId type (object id)!", 400);
      }

      const userUpdated = await User.findOne({ _id: updatedId });
      if (!userUpdated) {
        throw new CustomError("updatedId not found on Users!", 404);
      }
    }

    const carData = await Car.findOne({ _id: req.params.id });
    if (!carData) {
      throw new CustomError("Car not found!", 404);
    }

    const { modifiedCount } = await Car.updateOne(
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
      message: "Car is partially updated!",
      result: await Car.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
        #swagger.tags = ["Cars"]
        #swagger.summary = "Delete a car"
        #swagger.description = "Delete a car by id!"
        
        #swagger.responses[204] = {
            description: 'Car is deleted successfully!',
            
        }  
        #swagger.responses[400] = {
                description: 'Bad Request - invalid id type!',
                schema: { $ref: '#/definitions/Error' }

        } 
        #swagger.responses[404] = {
            description: 'Car not found!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[500] = {
            description: 'Something went wrong - car found on db but it couldn\'t be updated!',
            schema: { $ref: '#/definitions/Error' }

        }


     */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id(object id) type!", 400);
    }

    const car = await Car.findOne({ _id: req.params.id });
    if (!car) {
      throw new CustomError("Car not found!", 404);
    }

    const { deletedCount } = await Car.deleteOne({ _id: req.params.id });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong - issue at the end of the process!!",
        500
      );
    }

    res.sendStatus(204);
  },
};
