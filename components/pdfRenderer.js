import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  ReactPDF,
  Image,
} from "@react-pdf/renderer";

import logo from "./logo.png";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 50, // Adjust the logo size here
    height: 50,
    marginRight: 20,
  },
  companyName: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 20,
  },
  table: {
    width: "100%",
    border: "1px solid black",
    borderCollapse: "collapse",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: 5,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
    padding: 5,
    textAlign: "center",
  },
  tableCell: {
    padding: 5,
    fontSize: 8,
    width: "10%", // Adjust width if necessary
    borderRight: "1px solid #ddd",
  },
  lastTableCell: {
    padding: 5,
    fontSize: 8,
    borderRight: "none",
  },
});

function getDateFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0"); // Get day with leading zero
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function getTimeFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  let hours = date.getHours(); // Get the hours (0-23)
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Get minutes with leading zero
  const ampm = hours >= 12 ? "PM" : "AM"; // Determine AM/PM
  hours = hours % 12 || 12; // Convert 0-23 hours to 1-12
  return `${hours}:${minutes} ${ampm}`;
}

const AuditTrailPDF = ({ data, linkedEqp }) => {
  return data && linkedEqp ? (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          {/* <Image src="./logo.png" className=" z-99 " /> */}
          <Text style={styles.companyName}>ITAAN Pharma</Text>
        </View>
        <Text style={styles.title}>{linkedEqp} Audit Trail Report</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Date</Text>
            <Text style={styles.tableCell}>Product / Protocol Name</Text>
            <Text style={styles.tableCell}>Batch / Protocol No</Text>
            <Text style={styles.tableCell}>Activity Name</Text>
            <Text style={styles.tableCell}>Start Time</Text>
            <Text style={styles.tableCell}>End Time</Text>
            <Text style={styles.tableCell}>Activity Status</Text>
            <Text style={styles.tableCell}>Started By</Text>
            <Text style={styles.tableCell}>Reviewed By</Text>
            <Text style={styles.tableCell}>Remarks</Text>
          </View>
          {data.map((row, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>
                {getDateFromTimestamp(row.start_time)}
              </Text>
              <Text style={styles.tableCell}>{row.product_name}</Text>
              <Text style={styles.tableCell}>{row.batch_no}</Text>
              <Text style={styles.tableCell}>{row.activity_name}</Text>
              <Text style={styles.tableCell}>
                {getTimeFromTimestamp(row.start_time)}
              </Text>
              <Text style={styles.tableCell}>
                {getTimeFromTimestamp(row.end_time)}
              </Text>
              <Text style={styles.tableCell}>{row.activity_status}</Text>
              <Text style={styles.tableCell}>{row.performed_by}</Text>
              <Text style={styles.tableCell}>{row.reviewed_by}</Text>
              <Text style={styles.tableCell}>{row.remarks}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  ) : null;
};

export default AuditTrailPDF;
