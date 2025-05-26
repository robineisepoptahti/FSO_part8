import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { useState } from "react";

const Books = (props) => {
  const [filter, setFilter] = useState(null);
  const [titleText, setTitleText] = useState("");
  const [titleGenre, setTitleGenre] = useState("");
  const result = useQuery(ALL_BOOKS);
  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const books = result.data.allBooks;
  let tempBooks = filter
    ? books.filter((book) => book.genres.includes(filter))
    : books;

  let tempGenreList = books.flatMap((book) => book.genres);

  const genreList = [...new Set(tempGenreList)];

  console.log("genreList: ", books);

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
          {tempBooks.map((a) => (
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
