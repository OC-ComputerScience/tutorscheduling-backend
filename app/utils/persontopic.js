const db = require("../models");
const PersonTopic = db.persontopic;
const Topic = require("../utils/topic.js");

exports.createPersonTopic = async (personTopicData) => {
  // Create a persontopic
  const persontopic = {
    id: personTopicData.id,
    personId: personTopicData.personId,
    topicId: personTopicData.topicId,
    skillLevel: personTopicData.skillLevel,
  };

  // Save persontopic in the database
  return await PersonTopic.create(persontopic)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllPersonTopics = async () => {
  return await PersonTopic.findAll()
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findAllPersonTopicsForPerson = async (personId) => {
  return await PersonTopic.findAll({ where: { personId: personId } })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.findOnePersonTopic = async (id) => {
  return await PersonTopic.findByPk(id)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.updatePersonTopic = async (persontopic, id) => {
  return await PersonTopic.update(persontopic, {
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deletePersonTopicWithTopic = async (topicId) => {
  let disableTopics = await Topic.findAllDisabledTopics(topicId);
  let error;

  if (disableTopics[0] !== undefined && disableTopics !== null) {
    for (let i = 0; i < disableTopics[0].persontopic.length; i++) {
      let personTopic = disableTopics[0].persontopic[i];
      await this.deleteOnePersonTopic(personTopic.id).catch((err) => {
        error = err;
        return;
      });
    }
  } else {
    return `No person topics found for that disabled topic!`;
  }

  if (error !== undefined) {
    throw error;
  } else {
    return `Person topics were deleted successfully!`;
  }
};

exports.deleteOnePersonTopic = async (id) => {
  return await PersonTopic.destroy({
    where: { id: id },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      return err;
    });
};

exports.deleteAllPersonTopics = async () => {
  return await PersonTopic.destroy({
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
