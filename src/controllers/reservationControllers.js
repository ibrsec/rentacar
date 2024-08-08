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
            #swagger.description = `Permission: <b>Normal User</b></br></br>- Admin can list all reservation records!</br>- normal users can't list others' reservation records
                You can send query with endpoint for filter[],search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            
            `
        */

    const customfilter = { userId: req.user?.userId };

    if (req.user?.isAdmin || req.user?.isStaff) {
      delete customfilter.userId;
    }

    const reservations = await res.getModelList(Reservation, customfilter, [
      { path: "carId", select: "brand model" },
      { path: "userId", select: "username" },
      { path: "createdId", select: "username" },
      { path: "updatedId", select: "username" },
    ]);
    res.status(200).json({
      error: false,
      message: "Reservations are listed!",
      details: await res.getModelListDetails(Reservation, customfilter),
      result: reservations,
    });
  },
  create: async (req, res) => {
    /*
        #swagger.tags = ["Reservations"]
        #swagger.summary = "Create new reservation"
        #swagger.description = `Permission: <b>Normal user</b></br></br>Create a new reservation!!</br>Customers;</br>- can select start and end date and see the list of available cars on selected dates.</br>- can not reserve cars which are reserved by other customers on selected time period.</br>- can choose a car on the list and reserve that car, but can not reserve more than one car on a selected time period,</br>- can see the list of their reservations including past ones.</br>- can list, create, read their reservations.</br>- can not update, delete reservations.</br>- amount is calculated automaticly (pricePerDay * (endData - startDate))</br></br>- Admin can create reservation for himself or other users. if admin sends a userId reservation will be created for that user, or else reservation will be created for the admin himself.</br>- normal users can create a reservation for just himselves.`
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {  
                $carId: '56b1erfehe90856633456786',
                $startDate: '2024-08-26',
                $endDate: '2024-08-28',
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
            description: 'Bad Request </br>- carId, startDate, endDate fields are required! </br>- Invalid id, carId, userid type (object id)!</br>- Start date cant be less than current date!</br>- Start date cant be less than or equal to end date!</br>- Selected car is not avaliable! for renting!</br>- A reservation is exist on same dates for the user! - Choose another date!</br>- Selected car is not avaliable on selected dates! - Choose another car!! (returns avaliable Cars on asked dates)</br>',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'Not Found: </br>- userId not found on Users!</br>- carId not found on Users!</br>- createdId not found on Users!</br>- updatedId not found on Users!</br>',
            schema: { $ref: '#/definitions/Error' }

        }



     */

    const { carId, startDate, endDate, amount } = req.body;
    if (!carId || !startDate || !endDate) {
      throw new CustomError(
        "carId, startDate, endDate fields are required!",
        400
      );
    }

    //date validation checks
    const sdate = new Date(startDate);
    const edate = new Date(endDate);

    //1- sdate < currenttime
    if (sdate < new Date()) {
      throw new CustomError("Start date cant be less than current date!", 400);
    }
    //2- sdate >= edate
    if (sdate >= edate) {
      throw new CustomError(
        "Start date cant be less than or equal to end date!"
      );
    }

    if (req?.user?.isAdmin === false) {
      req.body.userId = req?.user?.userId;
    } else {
      if (!req.body?.userId) {
        //admin renting the car for himself
        req.body.userId = req?.user?.userId;
      }
      //if upper condition does not work then admin creates a reservation for somebody else, which admin sends the user id in body request
    }
    const userId = req.body?.userId;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid userId type (object id)!", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      throw new CustomError("Invalid carId type (object id)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("userId not found on Users!", 404);
    }

    const car = await Car.findOne({ _id: carId });
    if (!car) {
      throw new CustomError("carId not found on Users!", 404);
    }

    console.log("car", car);
    if (!car.isAvaliable) {
      throw new CustomError("Selected car is not avaliable! for renting!", 400);
    }

    req.body.createdId = req?.user?.userId;
    req.body.updatedId = req?.user?.userId;
    const { createdId, updatedId } = req.body;


    const userCreated = await User.findOne({ _id: createdId });
    if (!userCreated) {
      throw new CustomError("createdId not found on Users!", 404);
    }
    const userUpdated = await User.findOne({ _id: updatedId });
    if (!userUpdated) {
      throw new CustomError("updatedId not found on Users!", 404);
    }

    //MUSTERILER ---|>|
    // Tarih aralığı belirtip müsait araç listeleyebilir. ok

    //once-> dateler dogrumu, ok
    //end date start dateden kucukmu ok
    //start date current timedan kucukmu ok
    // Rezerve edilmiş bir aracı, o tarihlerde rezerve edemez. ok
    // Seçilen tarih aralığında araç rezerve edilebilir, ancak aynı tarih aralığında ikinci bir araç kiralayamaz. ->in progress

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

    //if dates are not avaliable, then response that info and give the user avaliable carIds on asked dates.
    if (isAvaliableDates.length > 0) {
      const isAvaliableDatesAllCars = await Reservation.find({
        $nor: [
          { startDate: { $gt: req.body.endDate } },
          { endDate: { $lt: req.body.startDate } },
        ],
      });

      const avaliableCars = await Car.find({
        _id: { $nin: isAvaliableDatesAllCars.map((item) => item.carId) },
      });

      const avaliableCarIds = avaliableCars.map((item) => item._id);

      res.status(400).json({
        error: true,
        message:
          "Selected car is not avaliable on selected dates! - Choose another car!!",
        avaliableCars: {
          message: "Avaliable cars on selected dates are listed!",
          result: avaliableCarIds,
        },
      });
      return;
    }

    // Seçilen tarih aralığında araç rezerve edilebilir, ancak aynı tarih aralığında ikinci bir araç kiralayamaz.
    const isDatesAvaliableForUser = await Reservation.find({
      userId,
      $nor: [{ startDate: { $gt: edate } }, { endDate: { $lt: sdate } }],
    });
    if (isDatesAvaliableForUser.length > 0) {
      throw new CustomError(
        "A reservation is exist on same dates for the user! - Choose another date!",
        400
      );
    }

    //if dates are avaliable for asked car then make the reservation

    //how many day user asked for renting the car end date - start day
    const reservedDay = (edate - sdate) / (1000 * 60 * 60 * 24);

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
            #swagger.description = "Permission: <b>Normal user</b></br></br>Get a reservation by id!!</br></br>- Admin can list all reservation records!</br>- normal users can't list others' reservation records"
            #swagger.responses[200] = {
                description: 'Added a new reservation...',
                schema: [{ $ref: '#/definitions/Reservation' }]
            }   
            #swagger.responses[400] = {
                description: 'Bad Request</br>- invalid id</br>-User can just see the own reservations! for listing other reservations, you must be a admin or staff user!',
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



    if (req.user?.isAdmin === false || req.user?.isStaff === false) {
        if(reservation?.userId !== req.user?.userId){
          throw new CustomError('User can just see the own reservations! for listing other reservations, you must be a admin or staff user!',400)
        }
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
        #swagger.description = "Permission: <b>Admin or Staff user</b></br></br>Update a reservation by id!!"
        #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {  
                $userId: '56b1erfehe90856633456786',
                $carId: '56b1erfehe90856633456786',
                $startDate: '2024-08-26',
                $endDate: '2024-08-28',
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
            description: 'Bad Request </br>- userId, carId, startDate, endDate fields are required! </br>- Invalid id, carId, userid type (object id)!</br>- Start date cant be less than current date!</br>- Start date cant be less than or equal to end date!</br>- Selected car is not avaliable! for renting!</br>- Selected car is not avaliable on selected dates! - Choose another car!! (returns avaliable Cars on asked dates)',
            schema: { $ref: '#/definitions/Error' }

        }
        #swagger.responses[404] = {
            description: 'Not Found</br>- Reservation not found!</br>- userId not found on Users!</br>carId not found on Users!</br>- createdId or updatedId not found on Users!',
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

    const {  userId, carId, startDate, endDate, amount,  } =
      req.body;
    if (!userId || !carId || !startDate || !endDate) {
      throw new CustomError(
        " userId, carId, startDate, endDate fields are required!",
        400
      );
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError("Invalid id(object id) type!", 400);
    }
    const reservationData = await Reservation.findOne({ _id: req.params.id });
    if (!reservationData) {
      throw new CustomError("Reservation not found!", 404);
    }

    //date validation checks
    const sdate = new Date(startDate);
    const edate = new Date(endDate);

    //1- sdate < currenttime
    if (sdate < new Date()) {
      throw new CustomError("Start date cant be less than current date!", 400);
    }
    //2- sdate >= edate
    if (sdate >= edate) {
      throw new CustomError(
        "Start date cant be less than or equal to end date!"
      );
    }

 
    

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Invalid userId type (object id)!", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      throw new CustomError("Invalid carId type (object id)!", 400);
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new CustomError("userId not found on Users!", 404);
    }

    const car = await Car.findOne({ _id: carId });
    if (!car) {
      throw new CustomError("carId not found on Users!", 404);
    }

    console.log("car", car);
    if (!car.isAvaliable) {
      throw new CustomError("Selected car is not avaliable! for renting!", 400);
    }

    delete req.body.createdId;
    req.body.updatedId = req?.user?.userId;

    const updatedId = req.body?.updatedId;

    const userUpdated = await User.findOne({ _id: updatedId });
    if (!userUpdated) {
      throw new CustomError("updatedId not found on Users!", 404);
    }

    // Seçilen tarih aralığında araç rezerve edilebilir, ancak aynı tarih aralığında ikinci bir araç kiralayamaz.
    // const isDatesAvaliableForUser = await Reservation.find({
    //   userId,
    //   _id: { $ne: req.params.id }, //except the asked reservation
    //   $nor: [{ startDate: { $gt: edate } }, { endDate: { $lt: sdate } }],
    // });
    // if (isDatesAvaliableForUser.length > 0) {
    //   throw new CustomError(
    //     "A reservation is exist on same dates for the user! - Choose another date!",
    //     400
    //   );
    // }

    /*

old reserv 1      :                               -----------
old reserv 2      :                       -------------
old reserv 3      :     -------
old reserv 4      :               --------    

new reservation   :                 ----------

*/

    const isAvaliableDates = await Reservation.find({
      carId,
      _id: { $ne: req.params.id }, //except the asked reservation
      $nor: [
        { startDate: { $gt: req.body.endDate } },
        { endDate: { $lt: req.body.startDate } },
      ],
    });

    //if dates are not avaliable, then response that info and give the user avaliable carIds on asked dates.
    if (isAvaliableDates.length > 0) {
      const isAvaliableDatesAllCars = await Reservation.find({
        $nor: [
          { startDate: { $gt: req.body.endDate } },
          { endDate: { $lt: req.body.startDate } },
        ],
      });

      const avaliableCars = await Car.find({
        _id: { $nin: isAvaliableDatesAllCars.map((item) => item.carId) },
      });

      const avaliableCarIds = avaliableCars.map((item) => item._id);

      res.status(400).json({
        error: true,
        message:
          "Selected car is not avaliable on selected dates! - Choose another car!!",
        avaliableCars: {
          message: "Avaliable cars on selected dates are listed!",
          result: avaliableCarIds,
        },
      });
      return;
    }

    //if dates are avaliable for asked car then make the reservation

    //how many day user asked for renting the car end date - start day
    const reservedDay = (edate - sdate) / (1000 * 60 * 60 * 24);

    ///amount -> car priceperday * reservedDay
    req.body.amount = car.pricePerDay * reservedDay;

    //////////

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
  delete: async (req, res) => {
    /*
        #swagger.tags = ["Reservations"]
        #swagger.summary = "Delete a reservation"
        #swagger.description = "Permission: <b>Admin user</b></br></br>Delete a reservation by id!"
        
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

