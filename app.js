const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let bd = null;

const startServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

startServer();

const caseConversion = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `select movie_name from movie;`;
  const moviesList = await db.all(getMoviesQuery);
  response.send(moviesList.map((eachPlayer) => caseConversion(eachPlayer)));
});

app.post("/movies/", async (request, response) => {
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const addMoviesQuery = `insert into movie (director_id,movie_name,lead_actor)
  values(${directorId},'${movieName}','${leadActor}');`;
  const moviesList = await db.run(addMoviesQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `select * from movie where movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(caseConversion(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const updateMovie = `update movie set director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}'
  where movie_id=${movieId}`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `delete from movie where movie_id=${movieId}`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectors = `select * from director`;
  const directorsList = await db.all(getDirectors);
  response.send(directorsList.map((eachObject) => caseConversion(eachObject)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieName = `select movie_name from movie where director_id=${directorId}`;
  const result = await db.all(getMovieName);
  response.send(result.map((eachItem) => caseConversion(eachItem)));
});
