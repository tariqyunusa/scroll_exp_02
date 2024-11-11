import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import ThreeScene from './ThreeScene';
import VirtualScroll from 'virtual-scroll';


function App() {
  const [data, setData] = useState([]);
  const [scrollTarget, setScrollTarget] = useState(0); 
  const sliderRef = useRef(null);

  const fetchMovies = async () => {
    const accessToken = import.meta.env.VITE_ACCESS_TOKEN;
    
    

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

  const setter = async () => {
    const movies = await fetchMovies();
    setData(movies);
  };

  useEffect(() => {
    // const scroller = new VirtualScroll();
    // scroller.on(event => {
    //   setScrollTarget(prev => prev + event.deltaY * 0.3);  // Unified scroll speed
    // });

    setter();

    return () => {
      scroller.destroy();
    };
  }, []);

  return (
    <div style={{ width: '90vw', height: '90vh', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
      <ThreeScene data={data} scrollTarget={scrollTarget} />
      {/* <div className="title__slider" ref={sliderRef} style={{ transform: `translateY(${-scrollTarget}px)` }}>
        {data && data.map((movie, index) => (
          <h3 key={index}>{movie.title}</h3>
        ))}
      </div> */}
    </div>
  );
}

export default App;
