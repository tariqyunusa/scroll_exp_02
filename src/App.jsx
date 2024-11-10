import React, { useEffect, useState } from 'react'
import './App.css'
import ThreeScene from './threeScene'

function App() {
  const [data, setData] = useState([])

  const setter = async () => {
    const movies = await fetchMovies()
    setData(movies)
  }

  useEffect(() => {
    setter()
  }, [])

  useEffect(() => {
    console.log("movies", data)
  }, [data]) 

  return (
    <>
      <div style={{width: "90vw", height: "100vh", display: "flex", justifyContent: "space-between", alignItems: "center", position:"relative"}}>
       
        <ThreeScene data={data} />
        <div className='title__slider'>{data && data.map((title, index) => (
          <h3 key={index}>{title.title}</h3>
        ))}</div>
      </div>
    </>
  )
}

export default App

const fetchMovies = async () => {
  const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMmQyZWEzM2Y3MjBhMTQ5MWU4MjE1MDM5MWEwNzYxZiIsIm5iZiI6MTczMTE0Njg0NC42NjE4MzUsInN1YiI6IjY1MjE1OTAzYzFmZmJkMDBmZTEwY2NmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1HGu69GzirQ6feFPTbec7aJUyaIhh5xaKNcymg49GPE';
  const url = 'https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data.results.map(movie => ({
    title: movie.title,
    posterPath: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
  }));
};
