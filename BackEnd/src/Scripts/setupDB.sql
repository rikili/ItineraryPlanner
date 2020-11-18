create database if not exists test;

use test;

Create Table Accommodation_Type_Cost
(
    Type       CHAR(20) PRIMARY KEY,
    Daily_Cost INTEGER
);

Create Table Accommodation_Rest
(
    Type          CHAR(20),
    CheckIn_Time  DATETIME(0),
    CheckOut_Time DATETIME(0),
    RoomNum       INTEGER,
    Address       CHAR(50),
    PRIMARY KEY (RoomNum, Address)
);

Create Table Itinerary_Cost
(
    Number_of_People INTEGER,
    Destination      CHAR(20),
    StartDate        DATE,
    EndDate          DATE,
    Estimated_Cost   INTEGER,
    PRIMARY KEY (StartDate, EndDate, Number_of_People, Destination)
);

Create Table Itinerary_Rest
(
    Number_of_People INTEGER,
    Destination      CHAR(20),
    TripID           INTEGER PRIMARY KEY,
    StartDate        DATE,
    EndDate          DATE
);

Create Table Custom_Itinerary
(
    ItineraryID INTEGER PRIMARY KEY,
    ParentID    INTEGER,
    FOREIGN KEY (ParentID)
        REFERENCES Itinerary_Rest (TripID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table Attractions
(
    Location CHAR(20),
    Name     CHAR(20) PRIMARY KEY
);

Create Table Train_Cost
(
    Train_lines CHAR(20) PRIMARY KEY,
    Ticket_Cost INTEGER
);

Create Table Bus_Cost
(
    Bus_lines   CHAR(20) PRIMARY KEY,
    Ticket_Cost INTEGER
);

Create Table Transport_Lines
(
    TransportID INTEGER PRIMARY KEY,
    Train_Lines CHAR(20),
    Bus_Lines   CHAR(20)
);

Create Table Company_User
(
    Company_userID INTEGER PRIMARY KEY,
    Company_name   CHAR(20),
    Location       CHAR(20)
);

Create Table Manager
(
    ManagerID     INTEGER PRIMARY KEY,
    CompanyUserID INTEGER,
    FOREIGN KEY (CompanyUserID)
        REFERENCES Company_User (Company_userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table Tour_Itinerary
(
    Company_Name CHAR(20) PRIMARY KEY,
    Phone_Number INTEGER,
    ParentID     INTEGER,
    ManagerID    INTEGER NOT NULL UNIQUE,
    FOREIGN KEY (ParentID)
        REFERENCES Itinerary_Rest (tripID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (ManagerID)
        REFERENCES Manager (ManagerID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table Personal_User
(
    UserID INTEGER PRIMARY KEY,
    Name   CHAR(20)
);

Create Table Account
(
    Username         CHAR(20) PRIMARY KEY,
    Email            CHAR(20),
    RegistrationDate DATE
);

Create table Cost_From_Tourist_Number
(
    Number_of_tourist INTEGER PRIMARY KEY,
    Cost              INTEGER
);

Create Table Tour_Guide
(
    PhoneNumber   INTEGER,
    Name          CHAR(20),
    Tour_guideID  INTEGER PRIMARY KEY,
    CompanyUserID INTEGER,
    FOREIGN KEY (CompanyUserID)
        REFERENCES Company_User (Company_userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table CompanyID_And_Name
(
    Number_of_tourists INTEGER,
    Tour_GuideID       INTEGER,
    TourID             INTEGER,
    Company_name       CHAR(20),
    Primary Key (TourID, Company_name),
    FOREIGN KEY (Tour_guideID)
        REFERENCES Tour_Guide (Tour_guideID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (Company_name)
        REFERENCES Tour_Itinerary (Company_name)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table Rentals
(
    RentalID INTEGER PRIMARY KEY
);

Create Table Vehicles
(
    RentalRate INTEGER,
    CarType    CHAR(20) PRIMARY KEY,
    RentalID   INTEGER,
    FOREIGN KEY (RentalID)
        REFERENCES Rentals (RentalID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table Recreational_Equipment
(
    Cost           INTEGER,
    Equipment_type CHAR(20) PRIMARY KEY,
    RentalID       INTEGER,
    FOREIGN KEY (RentalID)
        REFERENCES Rentals (RentalID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table Itinerary_Available_To_Attractions
(
    TripID INTEGER,
    Name   CHAR(20),
    PRIMARY KEY (TripID, Name),
    FOREIGN KEY (TripID)
        REFERENCES Itinerary_Rest (TripID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (Name)
        REFERENCES Attractions (Name)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table Custom_Public_Transportation
(
    TransportID INTEGER,
    ItineraryID INTEGER,
    PRIMARY KEY (TransportID, ItineraryID),
    FOREIGN KEY (TransportID)
        REFERENCES Transport_Lines (TransportID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (ItineraryID)
        REFERENCES Custom_Itinerary (ItineraryID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table Custom_Itinerary_Manages
(
    ItineraryID INTEGER,
    UserID      INTEGER,
    PRIMARY KEY (ItineraryID, UserID),
    FOREIGN KEY (ItineraryID)
        REFERENCES Custom_Itinerary (ItineraryID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (UserID)
        REFERENCES Personal_User (UserID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table User_Account
(
    UserID   INTEGER,
    Username CHAR(20),
    PRIMARY KEY (UserID, Username),
    FOREIGN KEY (UserID)
        REFERENCES Personal_User (UserID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (Username)
        REFERENCES Account (Username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table Itinerary_Contains_Accommodation
(
    RoomNum INTEGER,
    Address CHAR(50),
    TripID  INTEGER NOT NULL,
    PRIMARY KEY (RoomNum, Address, TripID),
    FOREIGN KEY (RoomNum, Address)
        REFERENCES accommodation_rest (RoomNum, Address)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (TripID)
        REFERENCES Itinerary_Rest (TripID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

Create Table Custom_Itinerary_Rentals
(
    ItineraryID INTEGER,
    RentalID    INTEGER,
    PRIMARY KEY (ItineraryID, RentalID),
    FOREIGN KEY (ItineraryID)
        REFERENCES Custom_Itinerary (ItineraryID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (RentalID)
        REFERENCES Rentals (RentalID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
