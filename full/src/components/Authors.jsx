import { ALL_AUTHORS } from "../queries";
import { useQuery } from "@apollo/client";
import { useState } from "react";
import { EDIT_AUTHOR } from "../queries";
import { useMutation } from "@apollo/client";

const Authors = (props) => {
  const [year, setYear] = useState("");
  const [name, setAuthor] = useState("");

  const result = useQuery(ALL_AUTHORS);

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = async (event) => {
    event.preventDefault();
    editAuthor({ variables: { name, setBornTo: Number(year) } });
  };

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }
  const authors = result.data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={submit}>
        <h2>Set birthyear</h2>
        <div>
          <br />
          name
          <input
            value={name}
            onChange={({ target }) => setAuthor(target.value)}
          />
          <br />
          born
          <input
            value={year}
            onChange={({ target }) => setYear(target.value)}
          />
          <br />
          <button type="submit">Update author</button>
        </div>
      </form>
    </div>
  );
};

export default Authors;
