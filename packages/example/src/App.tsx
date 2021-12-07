import "./App.css";
import {useQuery} from "react-query";

function App() {
    const customers = useQuery("customers", async () => {
        return [
            {name: "Adam", customerNr: 0, payment: true},
            {name: "Bertil", customerNr: 1, payment: false},
        ]

    })
    if (!customers.data) return <div>...Loading</div>
    return (
        <div className="App">
            <h1>Kunder</h1>
            <table className="Table">
                <thead>
                <tr>
                    <th>Namn</th>
                    <th>KundNr</th>
                    <th>Betalning</th>
                </tr>
                </thead>
                <tbody>
                {
                    customers.data.map((customer, index) => <tr key={index}>
                        <td>{customer.name}</td>
                        <td>{customer.customerNr}</td>
                        <td>{customer.payment ? '✔️' : ''}</td>
                    </tr>)
                }
                </tbody>
            </table>
        </div>
    );
}

export default App;
