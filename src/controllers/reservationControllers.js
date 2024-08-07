"use strict";

const { mongoose } = require("../configs/dbConnection");
const CustomError = require("../errors/customError");
const { Car } = require("../models/carModel");
const { Reservation } = require("../models/reservationModel");
const { User } = require("../models/userModel");

module.exports.reservation = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Reservations"]
            #swagger.summary = "List Reservations"
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
    const reservations = await res.getModelList(Reservation);
    res.status(200).json({
      error: false,
      message: "Reservations are listed!",
      details: await res.getModelListDetails(Reservation),
      result: reservations,
    });
  },
  create: async (req, res) => {
    /*
        #swagger.tags = ["Reservations"]
        #swagger.summary = "Create new reservation"
        #swagger.description = "Create a new reservation!!</br>- year must be between min 2000 to max current year"
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
                isAutomatic:false
            }
        }
        #swagger.responses[201] = {
            description: 'Added a new reservation...',
            schema: { 
                error: false,
                message: "Reservation is created!",
                result:{$ref: '#/definitions/Reservation'} 
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

    const { userId, carId, startDate, endDate, amount, createdId, updatedId } =
      req.body;
    if (
      !userId ||
      !carId ||
      !startDate ||
      !endDate ||
      !createdId ||
      !updatedId
    ) {
      throw new CustomError(
        "userId, carId, startDate, enddate, createdId, updatedId fields are required!",
        400
      );
    }

    console.log('startDate', startDate, typeof startDate)
    console.log('endDate', endDate, typeof endDate)

    //date validation checks
    const sdate = new Date(startDate); 
    const edate = new Date(endDate); 
    console.log('sDate', sdate, typeof sdate)
    console.log('eDate', edate, typeof edate)

    //1- sdate < currenttime
    if(sdate < new Date()){
      throw new CustomError('Start date cant be less than current date!')
    }
    //2- sdate >= edate
    if(sdate >= edate){
      throw new CustomError('Start date cant be less than or equal to end date!')
    }
    
   
   





    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid userId type (object id)!", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      throw new CustomError("Invalid carId type (object id)!", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(createdId)) {
      throw new CustomError("Invalid createdId type (object id)!", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(updatedId)) {
      throw new CustomError("Invalid updatedId type (object id)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("userId not found on Users!", 404);
    }

    const car = await Car.findOne({ _id: carId });
    if (!car) {
      throw new CustomError("carId not found on Users!", 404);
    }

    console.log('car', car)
    if (!car.isAvaliable) {
      throw new CustomError("Selected car is not avaliable!?", 400);
    }

    const userCreated = await User.findOne({ _id: createdId });
    if (!userCreated) {
      throw new CustomError("createdId not found on Users!", 404);
    }
    const userUpdated = await User.findOne({ _id: updatedId });
    if (!userUpdated) {
      throw new CustomError("updatedId not found on Users!", 404);
    }

    //MUSTERILER ---|>|
    // Tarih aralığı belirtip müsait araç listeleyebilir. -farkli endpoint

      //once-> dateler dogrumu, 
        //end date start dateden kucukmu
        //start date current timedan kucukmu
    // Rezerve edilmiş bir aracı, o tarihlerde rezerve edemez.
    // Seçilen tarih aralığında araç rezerve edilebilir, ancak aynı tarih aralığında ikinci bir araç kiralayamaz.

    /*

old reserv 1      :                               -----------
old reserv 2      :                       -------------
old reserv 3      :     -------
old reserv 4      :               --------    

new reservation   :                 ----------

*/

    const isAvaliableDates = await Reservation.find({
      carId,
      $nor: [
        { startDate: { $gt: req.body.endDate } },
        { endDate: { $lt: req.body.startDate } },
      ],
    });

    

    //reserved day
    
  
    //if dates are not avaliable, then response that info and give the user avaliable carIds on asked dates.
    if(isAvaliableDates.length > 0){


      const isAvaliableDatesAllCars = await Reservation.find({
        $nor: [
          { startDate: { $gt: req.body.endDate } },
          { endDate: { $lt: req.body.startDate } },
        ],
      });

 

      const avaliableCars = await Car.find({
        _id:{$nin: isAvaliableDatesAllCars.map(item=>item.carId)}
      })
      
      const avaliableCarIds =  avaliableCars.map(item=>item._id)

 
      res.status(400).json({
        error:true,
        message:'Selected car is not avaliable on selected dates!',
        avaliableCars:{
          message:'Avaliable cars on selected dates are listed!', 
          result: avaliableCarIds
        }
      })
      return;
    }


    //if dates are avaliable for asked car then make the reservation

    //how many day user asked for renting the car end date - start day
    const reservedDay = (edate - sdate) / (1000 * 60 * 60  * 24);

    ///amount -> car priceperday * reservedDay
    req.body.amount = car.pricePerDay * reservedDay;


    const newReservation = await Reservation.create(req.body);

    res.status(201).json({
      error: false,
      message: "Reservation is created!",
      result: newReservation,
    });
  },
  read: async (req, res) => {
    /*
            #swagger.tags = ["Reservations"]
            #swagger.summary = "Get a reservation"
            #swagger.description = "Get a reservation by id!!"
            #swagger.responses[200] = {
                description: 'Added a new reservation...',
                schema: [{ $ref: '#/definitions/Reservation' }]
            }   
            #swagger.responses[400] = {
                description: 'Bad Request invalid id',
                schema: { $ref: '#/definitions/Error' }

            }
            #swagger.responses[404] = {
                description: 'Reservation not found!',
                schema: { $ref: '#/definitions/Error' }

            }
    
    */
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid id (objectId )type!");
    }
    const reservation = await Reservation.findOne({ _id: req.params.id });
    if (!reservation) {
      throw new CustomError("Reservation not found!", 404);
    }
    res.status(200).json({
      error: false,
      message: "Reservation is found!",
      result: reservation,
    });
  },
  update: async (req, res) => {
    /*
        #swagger.tags = ["Reservations"]
        #swagger.summary = "Update a reservation"
        #swagger.description = "Update a reservation by id!!"
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
                isAutomatic:false
            }
        }
        #swagger.responses[202] = {
            description: 'Update is successfull!',
            schema: { 
                error: false,
                message: "Reservation is updated!",
                result:{$ref: '#/definitions/Reservation'} 
            }

        }  
        #swagger.responses[400] = {
            description: 'Bad Request </br>- plateNumber, brand, model, year, pricePerDay, createdId, updatedId fields are required! </br>- Invalid id, createdId, updatedId type (object id)!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'Not Found</br>- createdId or updatedId not found on Users!</br>- Reservation not found!',
            schema: { $ref: '#/definitions/Error' }

        }
        
        #swagger.responses[500] = {
            description: 'Something went wrong - reservation found on db but it couldn\'t be updated!',
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
    const reservationData = await Reservation.findOne({ _id: req.params.id });
    if (!reservationData) {
      throw new CustomError("Reservation not found!", 404);
    }

    const { modifiedCount } = await Reservation.updateOne(
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
      message: "Reservation is updated!",
      result: await Reservation.findOne({ _id: req.params.id }),
    });
  },
  patchUpdate: async (req, res) => {
    /*
        #swagger.tags = ["Reservations"]
        #swagger.summary = "Partially Update a reservation"
        #swagger.description = "Partially Update a reservation by id!! Provide at least one field!"
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
                isAutomatic:false
            
            }
        }
        #swagger.responses[202] = {
            description: 'Partially update is successfull!',
            schema: { 
                error: false,
                message: "Reservation is partially updated!",
                result:{$ref: '#/definitions/Reservation'} 
            }

        }  
        #swagger.responses[400] = {
            description: 'Bad Request </br>- At least on field is required! - plateNumber, brand, model, year, isAutomatic, pricePerDay, createdId, updatedId! </br>- Invalid id, createdId, updatedId type (object id)!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'Not Found</br>- createdId or updatedId not found on Users!</br>- Reservation not found!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[500] = {
            description: 'Something went wrong - reservation found on db but it couldn\'t be updated!',
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
      !(
        plateNumber ||
        brand ||
        model ||
        year ||
        pricePerDay ||
        createdId ||
        updatedId ||
        isAutomatic
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

    const reservationData = await Reservation.findOne({ _id: req.params.id });
    if (!reservationData) {
      throw new CustomError("Reservation not found!", 404);
    }

    const { modifiedCount } = await Reservation.updateOne(
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
      message: "Reservation is partially updated!",
      result: await Reservation.findOne({ _id: req.params.id }),
    });
  },
  delete: async (req, res) => {
    /*
        #swagger.tags = ["Reservations"]
        #swagger.summary = "Delete a reservation"
        #swagger.description = "Delete a reservation by id!"
        
        #swagger.responses[204] = {
            description: 'Reservation is deleted successfully!',
            
        }  
        #swagger.responses[400] = {
                description: 'Bad Request - invalid id type!',
                schema: { $ref: '#/definitions/Error' }

        } 
        #swagger.responses[404] = {
            description: 'Reservation not found!',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[500] = {
            description: 'Something went wrong - reservation found on db but it couldn\'t be updated!',
            schema: { $ref: '#/definitions/Error' }

        }


     */

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id(object id) type!", 400);
    }

    const reservation = await Reservation.findOne({ _id: req.params.id });
    if (!reservation) {
      throw new CustomError("Reservation not found!", 404);
    }

    const { deletedCount } = await Reservation.deleteOne({
      _id: req.params.id,
    });
    if (deletedCount < 1) {
      throw new CustomError(
        "Something went wrong - issue at the end of the process!!",
        500
      );
    }

    res.sendStatus(204);
  },
};
