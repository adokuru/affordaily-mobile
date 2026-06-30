import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { theme } from "@/constants/Theme";
import { Button } from "@/components/ui";

type BookingSummary = {
  id: string;
  booking_reference: string;
  guest: {
    name: string;
    phone: string;
  };
  room: {
    room_number: string;
    bed_type: string;
  };
  check_in_time: string;
  check_out_time: string;
  scheduled_checkout_time: string;
  number_of_nights: string;
  status: string;
  total_amount: string;
  amount_paid: string;
  remaining_balance: string;
};

export default function BookingSummaryScreen() {
  const params = useLocalSearchParams();

  // Parse booking data from params
  const booking: BookingSummary = {
    id: params.id as string,
    booking_reference: params.booking_reference as string,
    guest: {
      name: params.guest_name as string,
      phone: params.guest_phone as string,
    },
    room: {
      room_number: params.room_number as string,
      bed_type: params.bed_type as string,
    },
    check_in_time: params.check_in_time as string,
    check_out_time: params.check_out_time as string,
    scheduled_checkout_time: params.scheduled_checkout_time as string,
    number_of_nights: params.number_of_nights as string,
    status: params.status as string,
    total_amount: params.total_amount as string,
    amount_paid: params.amount_paid as string,
    remaining_balance: params.remaining_balance as string,
  };

  const handlePrint = async () => {
    try {
      const htmlContent = generateHTMLContent(booking);

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Print failed:", error);
      Alert.alert("Print Error", "Failed to generate print document.");
    }
  };

  const handleShare = async () => {
    try {
      const htmlContent = generateHTMLContent(booking);

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Share failed:", error);
      Alert.alert("Share Error", "Failed to share document.");
    }
  };

  const handleDone = () => {
    // Reset and go back to checkin screen
    router.replace("/(tabs)/checkin");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={34} color="#214E2B" />
          </View>
          <Text style={styles.successTitle}>Check-In Successful</Text>
          <Text style={styles.successSubtitle}>
            The stay is confirmed and ready for the guest.
          </Text>
        </View>

        {/* Booking Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="document-text"
              size={24}
              color={theme.colors.secondary}
            />
            <Text style={styles.cardTitle}>Booking Details</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="link" size={20} color={theme.colors.gray[500]} />
              <Text style={styles.detailLabel}>Reference</Text>
            </View>
            <Text style={styles.detailValue}>{booking.booking_reference}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons
                name="person"
                size={20}
                color={theme.colors.gray[500]}
              />
              <Text style={styles.detailLabel}>Guest Name</Text>
            </View>
            <Text style={styles.detailValue}>{booking.guest.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="call" size={20} color={theme.colors.gray[500]} />
              <Text style={styles.detailLabel}>Phone</Text>
            </View>
            <Text style={styles.detailValue}>{booking.guest.phone}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="bed" size={20} color={theme.colors.gray[500]} />
              <Text style={styles.detailLabel}>Room</Text>
            </View>
            <Text style={styles.detailValue}>
              Room {booking.room.room_number} ({booking.room.bed_type})
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons name="moon" size={20} color={theme.colors.gray[500]} />
              <Text style={styles.detailLabel}>Nights</Text>
            </View>
            <Text style={styles.detailValue}>
              {booking.number_of_nights} night(s)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons
                name="calendar"
                size={20}
                color={theme.colors.gray[500]}
              />
              <Text style={styles.detailLabel}>Status</Text>
            </View>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentText}>
                {booking.status === "checked_in"
                  ? "Checked In"
                  : booking.status}
              </Text>
            </View>
          </View>

          {booking.remaining_balance &&
            parseFloat(booking.remaining_balance) > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color={theme.colors.warning}
                  />
                  <Text style={styles.detailLabel}>Remaining Balance</Text>
                </View>
                <Text style={styles.detailValue}>
                  ₦{parseInt(booking.remaining_balance).toLocaleString()}
                </Text>
              </View>
            )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              ₦{parseInt(booking.total_amount).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Check-in Time */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={24} color={theme.colors.secondary} />
            <Text style={styles.cardTitle}>Check-In Information</Text>
          </View>
          <Text style={styles.timeText}>
            {new Date(booking.check_in_time).toLocaleString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
            <Ionicons name="print" size={24} color={theme.colors.secondary} />
            <Text style={styles.actionText}>Print</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons
              name="share-social"
              size={24}
              color={theme.colors.secondary}
            />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.doneButtonContainer}>
          <Button title="Done" onPress={handleDone} style={styles.doneButton} />
        </View>
      </ScrollView>
    </View>
  );
}

function generateHTMLContent(booking: BookingSummary) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Receipt</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #333;
          font-size: 24px;
        }
        .success-badge {
          background-color: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          display: inline-block;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .detail-label {
          color: #666;
          font-weight: 500;
        }
        .detail-value {
          font-weight: bold;
          color: #333;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-top: 2px solid #333;
          margin-top: 15px;
          font-size: 20px;
          font-weight: bold;
        }
        .warning-row {
          background-color: #fef3c7;
          padding: 10px;
          border-radius: 5px;
          margin-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="success-badge">✓ Check-In Successful</div>
        <h1>Booking Receipt</h1>
      </div>

      <div class="section">
        <div class="section-title">Guest Information</div>
        <div class="detail-row">
          <span class="detail-label">Reference:</span>
          <span class="detail-value">${booking.booking_reference}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Guest Name:</span>
          <span class="detail-value">${booking.guest.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phone:</span>
          <span class="detail-value">${booking.guest.phone}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="detail-row">
          <span class="detail-label">Room:</span>
          <span class="detail-value">Room ${booking.room.room_number} (${
    booking.room.bed_type
  })</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Number of Nights:</span>
          <span class="detail-value">${booking.number_of_nights} night(s)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value">${
            booking.status === "checked_in" ? "Checked In" : booking.status
          }</span>
        </div>
        ${
          booking.remaining_balance && parseFloat(booking.remaining_balance) > 0
            ? `
        <div class="warning-row">
          <div class="detail-row">
            <span class="detail-label">Remaining Balance:</span>
            <span class="detail-value">₦${parseInt(
              booking.remaining_balance
            ).toLocaleString()}</span>
          </div>
        </div>
        `
            : ""
        }
        <div class="total-row">
          <span>Total Amount:</span>
          <span>₦${parseInt(booking.total_amount).toLocaleString()}</span>
        </div>
        ${
          booking.amount_paid
            ? `
        <div class="detail-row">
          <span class="detail-label">Amount Paid:</span>
          <span class="detail-value">₦${parseInt(
            booking.amount_paid
          ).toLocaleString()}</span>
        </div>
        `
            : ""
        }
      </div>

      <div class="section">
        <div class="section-title">Check-In Information</div>
        <div class="detail-row">
          <span class="detail-label">Check-In Time:</span>
          <span class="detail-value">${new Date(
            booking.check_in_time
          ).toLocaleString("en-NG")}</span>
        </div>
        ${
          booking.scheduled_checkout_time
            ? `
        <div class="detail-row">
          <span class="detail-label">Scheduled Check-Out:</span>
          <span class="detail-value">${new Date(
            booking.scheduled_checkout_time
          ).toLocaleString("en-NG")}</span>
        </div>
        `
            : ""
        }
      </div>

      <div class="footer">
        <p>Generated by Affordaily - Guest Management System</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAF1',
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  successIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#D0F253',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#EEF7EA',
  },
  successTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#143B1D',
    marginTop: theme.spacing.md,
  },
  successSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: '#55735C',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#DDEBD5',
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#DDEBD5',
    paddingBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#143B1D',
    marginLeft: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF4E9',
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.md,
    color: '#55735C',
    marginLeft: theme.spacing.sm,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#143B1D',
    textAlign: "right",
  },
  paymentBadge: {
    backgroundColor: '#EEF7EA',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 6,
  },
  paymentText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#527B2E',
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: '#D0F253',
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#143B1D',
  },
  totalValue: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#214E2B',
  },
  timeText: {
    fontSize: theme.typography.fontSize.md,
    color: '#355D3D',
    fontWeight: theme.typography.fontWeight.medium,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: theme.spacing.lg,
  },
  actionButton: {
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#DDEBD5',
  },
  actionText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: '#214E2B',
  },
  doneButtonContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  doneButton: {
    backgroundColor: '#214E2B',
  },
});
