const db = require("../models");
const PersonTopic = db.persontopic;

exports.createPersonTopic = async (personTopicData) => {
  if (!personTopicData.skillLevel) {
    const error = new Error("Skill level cannot be empty for person topic!");
    error.statusCode = 400;
    throw error;
  }

  // Create a persontopic
  const persontopic = {
    id: personTopicData.id,
    skillLevel: personTopicData.skillLevel,
    personId: personTopicData.personId,
    topicId: personTopicData.topicId,
  };

  // Save persontopic in the database
  return await PersonTopic.create(persontopic);
};

exports.findAllPersonTopics = async () => {
  return await PersonTopic.findAll();
};

exports.findAllPersonTopicsForPerson = async (personId) => {
  return await PersonTopic.findAll({ where: { personId: personId } });
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

exports.deleteAllPersonTopics = async () => {
  return await PersonTopic.destroy({
    where: {},
    truncate: false,
  });
};
