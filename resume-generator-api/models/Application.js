const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Application = sequelize.define("Application", {
  // ORM தானாகவே 'id' (Primary Key) உருவாக்கிவிடும்
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  jobName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  portal: {
    type: DataTypes.STRING, // Adzuna, AI Engine, etc.
  },
  experience: {
    type: DataTypes.STRING,
  }
}, {
  // இது 'createdAt' மற்றும் 'updatedAt' காலம்களை தானாகவே சேர்த்துக்கொள்ளும்
  timestamps: true,
});

// டேபிளை Neon DB-யுடன் சிங்க் செய்கிறோம்
Application.sync({ alter: true })
  .then(() => console.log("Applications Table Ready via ORM ✅"))
  .catch(err => console.log("ORM Table Sync Error ❌", err));

module.exports = Application;