import { useFrappeGetDocList } from "frappe-react-sdk"

const Invoices = () => {

    const sales_query = useFrappeGetDocList("Sales Invoice", {
        fields: ["*"],
        // filters: [["status", "!=", "Completed"]],
    });

    console.log("Sales Query:", sales_query);

    if (sales_query.isLoading) {
        return <div>Loading Invoices...</div>
    }
    return (

    <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-4 py-2 border">Invoice #</th>
                    <th className="px-4 py-2 border">Customer</th>
                    <th className="px-4 py-2 border">Posting Date</th>
                    <th className="px-4 py-2 border">Due Date</th>
                    <th className="px-4 py-2 border">Grand Total</th>
                    <th className="px-4 py-2 border">Outstanding</th>
                    <th className="px-4 py-2 border">Status</th>
                </tr>
            </thead>
            <tbody>
                {sales_query.data?.map((invoice) => (
                    <tr key={invoice.name} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{invoice.name}</td>
                        <td className="px-4 py-2 border">{invoice.customer_name}</td>
                        <td className="px-4 py-2 border">{invoice.posting_date}</td>
                        <td className="px-4 py-2 border">{invoice.due_date}</td>
                        <td className="px-4 py-2 border">{invoice.currency} {invoice.grand_total.toFixed(2)}</td>
                        <td className="px-4 py-2 border">{invoice.currency} {invoice.outstanding_amount.toFixed(2)}</td>
                        <td className="px-4 py-2 border">
                            <span className={`px-2 py-1 rounded text-sm ${
                                invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                invoice.status === 'Unpaid' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {invoice.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    )
}

export default Invoices
