const db = require("../models");
const Location = db.location;

exports.createLocation = async (locationData) => {
  // Create a Location
  const location = {
    id: locationData.id,
    name: locationData.name,
    type: locationData.type,
    building: locationData.building,
    description: locationData.description,
    status: locationData.status ? locationData.status : "active",
    groupId: locationData.groupId,
  };

  // Save Location in the database
  return await Location.create(location)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllLocations = async () => {
  return await Location.findAll({
    order: [
      ["status", "ASC"],
      ["name", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllLocationsForGroup = async (groupId) => {
  return await Location.findAll({
    where: { groupId: groupId },
    order: [
      ["status", "ASC"],
      ["name", "ASC"],
    ],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findActiveLocationsForGroup = async (groupId) => {
  return await Location.findAll({
    where: { groupId: groupId, status: "active" },
    order: [["name", "ASC"]],
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOneLocation = async (id) => {
  return await Location.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updateLocation = async (location, id) => {
  return await Location.update(location, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteLocation = async (id) => {
  return await Location.destroy({
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllLocations = async () => {
  return await Location.destroy({
    where: {},
    truncate: false,
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};
