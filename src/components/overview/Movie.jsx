import React from 'react'

function Movie({id}) {
  return (
    <div className="w-full aspect-video">
      <iframe
        src={`https://www.vidking.net/embed/movie/${id}?color=9146ff&autoPlay=true`}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        className="w-full h-full min-h-150"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="Movie Player"
      ></iframe>
    </div>
  )
}

export default Movie