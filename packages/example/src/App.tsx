import "./App.css";
import {useQuery} from "react-query";
import {contracts} from "./contracts";
import {createDefaultFetch, defaultParams} from "cdc-contracts";

function App() {
    const customers = useQuery("customers", async () => {
        const result = await contracts.getCustomers.Fetch(
            {
                fetchFunc: createDefaultFetch(fetch, ""),
                path: {region: "region"},
                query: {logid: "someId"},
                header: {Authorization: "token"},
                body: undefined
            })

        return result.body

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
            <div>
                <h5>Add new customer</h5>
                <input value={"Caesar"}/>
                <button onClick={async () => {
                    await contracts.postAddCustomer.Fetch({
                        ...defaultParams,
                        body: {name: "Caesar"},
                        fetchFunc: createDefaultFetch(fetch, "")
                    })
                    customers.refetch()
                }}>Add new customer
                </button>
            </div>
        </div>
    );
}

export default App;
