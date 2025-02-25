const MoviesCollection = require("../models/movie-model");
const ActorsCollection = require("../models/actor-model");
const Games = require("../models/game-model");
const ApiErrors = require("../exceptions/exceptions");

class CollectionService {
  async saveCollectable(props) {
    const { user, data } = props;
    const { id } = data;
    const { id: userId } = user;

    if (data.type === "game") {
      const collectionGame = await Games.findOne({ id })
        .populate("developers")
        .populate("publishers")
        .populate("platforms");
      collectionGame.inCollectionUsers.push(userId);
      await collectionGame.save();
      collectionGame.inCollection = true;

      return collectionGame;
    }

    if (data.type === "movie") {
      const collectionMovie = await MoviesCollection.findOne({ id });
      if (!collectionMovie) {
        data.inCollectionUsers = [userId];
        try {
          await ActorsCollection.insertMany(data.actors, { ordered: false });
        } catch (error) {
          if (error.code !== 11000) {
            console.log(error);
          }
        }

        const storedActors = await ActorsCollection.find();
        const filmActorsObjectIds = storedActors
          .filter((actor) => data.actors.find((e) => e.id === actor.id))
          .map((e) => e._id);
        const newCollectionMovie = await MoviesCollection.create({
          ...data,
          actors: filmActorsObjectIds,
        });
        await newCollectionMovie.save();
        return newCollectionMovie;
      } else {
        if (collectionMovie.inCollectionUsers.includes(userId)) {
          throw ApiErrors.CollectionError("Уже в коллекции");
        }

        collectionMovie.inCollectionUsers.push(id);
        await collectionMovie.save();
        return collectionMovie;
      }
    }
  }

  async deleteCollectable(props) {
    const { user, data } = props;
    const { id } = data;
    const { id: userId } = user;

    if (data.type === "game") {
      const collectionGame = await Games.findOne({ id })
        .populate("developers")
        .populate("publishers")
        .populate("platforms");
      collectionGame.inCollectionUsers =
        collectionGame.inCollectionUsers.filter((e) => e.toString() !== userId);
      collectionGame.inCollection = false;
      await collectionGame.save();

      return collectionGame;
    }
  }
}

module.exports = new CollectionService();
