import { useQuery } from "@apollo/client";
import { ALL_BOOKS, FILTER_BOOKS } from "../queries";
import { useState } from "react";

const Books = (props) => {
  const [filter, setFilter] = useState(null);
  const [titleText, setTitleText] = useState("");
  const [titleGenre, setTitleGenre] = useState("");

  const query = filter ? FILTER_BOOKS : ALL_BOOKS;

  const result = useQuery(query, { variables: { genre: filter } });
  const displayGenres = useQuery(ALL_BOOKS, { variables: { genre: filter } });

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }
  const books = result.data.allBooks;
  let genreList = [
    ...new Set(displayGenres.data.allBooks.flatMap((book) => book.genres)),
  ];

  return (
    <div>
      <h2>books</h2>
      {titleText}
      <b>{titleGenre}</b>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genreList.map((genre) => (
          <button
            key={genre}
            onClick={() => {
              setFilter(genre);
              setTitleGenre(genre);
              setTitleText("In genre: ");
            }}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Books;
