const db = require("../models");
const PersonTopic = db.persontopic;

exports.createPersonTopic = async (personTopicData) => {
  if (personTopicData.skillLevel === undefined) {
    const error = new Error("Skill level cannot be empty for person topic!");
    error.statusCode = 400;
    throw error;
  } else if (personTopicData.personId === undefined) {
    const error = new Error("Person ID cannot be empty for person topic!");
    error.statusCode = 400;
    throw error;
  } else if (personTopicData.topicId === undefined) {
    const error = new Error("Topic ID cannot be empty for person topic!");
    error.statusCode = 400;
    throw error;
  }

  // make sure we don't create a duplicate value
  let existingPersonTopic = await this.findPersonTopicsForPersonForTopic(
    personTopicData.personId,
    personTopicData.topicId
  );

  if (existingPersonTopic[0] !== undefined) {
    return existingPersonTopic[0].dataValues;
  } else {
    // Create a persontopic
    const persontopic = {
      id: personTopicData.id,
      skillLevel: personTopicData.skillLevel,
      personId: personTopicData.personId,
      topicId: personTopicData.topicId,
    };

    // Save persontopic in the database
    return await PersonTopic.create(persontopic);
  }
};

exports.findAllPersonTopics = async () => {
  return await PersonTopic.findAll();
};

exports.findAllPersonTopicsForPerson = async (personId) => {
  return await PersonTopic.findAll({ where: { personId: personId } });
};

exports.findPersonTopicsForPersonForTopic = async (personId, topicId) => {
  return await PersonTopic.findAll({
    where: { personId: personId, topicId: topicId },
  });
};

exports.findOnePersonTopic = async (id) => {
  return await PersonTopic.findByPk(id);
};

exports.updatePersonTopic = async (persontopic, id) => {
  return await PersonTopic.update(persontopic, {
    where: { id: id },
  });
};

exports.deleteOnePersonTopic = async (id) => {
  return await PersonTopic.destroy({
    where: { id: id },
  });
};

exports.deletePersonTopicsForTopic = async (topicId) => {
  return await PersonTopic.destroy({
    where: { topicId: topicId },
  });
};

exports.deleteAllPersonTopics = async () => {
  return await PersonTopic.destroy({
    where: {},
    truncate: false,
  });
};
