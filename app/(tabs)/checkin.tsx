import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { theme } from "@/constants/Theme";
import { Button, Card, Input } from "@/components/ui";
import { CreateBookingData } from "@/services/api";
import { config } from "@/config/environment";
import { useGuestSearch } from "@/hooks/useGuestQueries";
import { useCreateBooking } from "@/hooks/useBookingQueries";
import { useRoomRates } from "@/hooks/useRoomQueries";

const getErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    error.errors &&
    typeof error.errors === "object"
  ) {
    const firstError = Object.values(
      error.errors as Record<string, string[]>
    ).flat()[0];

    if (firstError) {
      return firstError;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to process check-in. Please try again.";
};

const resolveStoredPhotoUri = (path?: string | null) => {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path) || path.startsWith("file://")) {
    return path;
  }

  const apiOrigin = config.apiUrl.replace(/\/api\/v\d+\/?$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${apiOrigin}/storage/${cleanPath}`;
};

const isLocalPhotoUri = (uri: string | null) =>
  !!uri && (uri.startsWith("file://") || uri.startsWith("content://"));

type CheckInFormData = {
  guestName: string;
  phone: string;
  idNumber: string;
  nights: string;
  paymentMethod: "cash" | "transfer";
  transferReference: string;
  amount: string;
  bedType: "A" | "B";
};

type FormStep = "phone" | "guest-info" | "payment";

export default function CheckInScreen() {
  const { guest_name, guest_phone, id_photo_path, number_of_nights } =
    useLocalSearchParams<{
      guest_name?: string | string[];
      guest_phone?: string | string[];
      id_photo_path?: string | string[];
      number_of_nights?: string | string[];
    }>();

  const toSingle = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const [currentStep, setCurrentStep] = useState<FormStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formData, setFormData] = useState<CheckInFormData>({
    guestName: "",
    phone: "",
    idNumber: "",
    nights: "1",
    paymentMethod: "cash",
    transferReference: "",
    amount: "",
    bedType: "A",
  });

  const [idPhotoUri, setIdPhotoUri] = useState<string | null>(null);

  // helpers
  const isValidPhone = (phone: string) => /^\d{11}$/.test(phone);
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setPhoneNumber(digits);
  };

  // TanStack Query hooks
  const {
    data: guestSearchResult,
    isLoading: guestSearchLoading,
    error: guestSearchError,
  } = useGuestSearch(phoneNumber, isValidPhone(phoneNumber));
  const { data: roomRatesData } = useRoomRates();
  const createBookingMutation = useCreateBooking();

  const foundGuest = guestSearchResult?.data || null;
  const loading = guestSearchLoading || createBookingMutation.isPending;

  useEffect(() => {
    const name = toSingle(guest_name);
    const phone = toSingle(guest_phone);
    const photo = toSingle(id_photo_path);
    const nightsParam = toSingle(number_of_nights);

    if (phone) {
      setPhoneNumber(phone);
      setFormData((prev: CheckInFormData) => ({
        ...prev,
        phone: phone,
      }));
    }

    if (name) {
      setFormData((prev: CheckInFormData) => ({
        ...prev,
        guestName: name,
      }));
    }

    if (nightsParam) {
      setFormData((prev: CheckInFormData) => ({
        ...prev,
        nights: String(parseInt(nightsParam) || 1),
      }));
    }

    if (photo) {
      setIdPhotoUri(resolveStoredPhotoUri(photo));
    }
  }, [guest_name, guest_phone, id_photo_path, number_of_nights]);

  // Update form data when guest search results change
  useEffect(() => {
    if (foundGuest && phoneNumber) {
      setFormData((prev) => ({
        ...prev,
        guestName: foundGuest.name,
        phone: foundGuest.phone,
        idNumber: foundGuest.id_number || prev.idNumber,
      }));
      setIdPhotoUri(resolveStoredPhotoUri(foundGuest.id_photo_path));
    } else if (phoneNumber && !guestSearchLoading && !guestSearchError) {
      // Guest not found, clear form data
      setFormData((prev) => ({
        ...prev,
        phone: phoneNumber,
        guestName: "",
        idNumber: "",
      }));
      setIdPhotoUri(null);
    }
  }, [foundGuest, phoneNumber, guestSearchLoading, guestSearchError]);

  const handlePhoneSubmit = () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Missing Phone", "Please enter a phone number");
      return;
    }
    if (!isValidPhone(phoneNumber)) {
      Alert.alert("Invalid Phone", "Phone number must be 11 digits.");
    }
  };

  const proceedToGuestInfo = () => {
    if (!isValidPhone(phoneNumber)) {
      Alert.alert("Invalid Phone", "Phone number must be 11 digits.");
      return;
    }
    setFormData((prev: CheckInFormData) => ({ ...prev, phone: phoneNumber }));
    setCurrentStep("guest-info");
  };

  const proceedToPayment = () => {
    const phone = formData.phone || phoneNumber;
    if (!formData.guestName.trim()) {
      Alert.alert("Missing Information", "Please enter the guest name.");
      return;
    }
    if (!isValidPhone(phone)) {
      Alert.alert("Invalid Phone", "Phone number must be 11 digits.");
      return;
    }
    setCurrentStep("payment");
  };

  const goBack = () => {
    if (currentStep === "guest-info") {
      setCurrentStep("phone");
    } else if (currentStep === "payment") {
      setCurrentStep("guest-info");
    }
  };

  const handleInputChange = (field: keyof CheckInFormData, value: string) => {
    setFormData((prev: CheckInFormData) => ({ ...prev, [field]: value }));
  };

  const captureIdPhoto = async () => {
    try {
      // Request camera permissions
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.status !== "granted") {
        Alert.alert(
          "Camera Permission Required",
          "Please grant camera permission to capture ID photos.",
          [{ text: "OK" }]
        );
        return;
      }

      // Show action sheet for camera options
      Alert.alert(
        "Capture ID Photo",
        "Choose how you want to capture the guest ID photo:",
        [
          {
            text: "Camera",
            onPress: openCamera,
          },
          {
            text: "Photo Library",
            onPress: openImagePicker,
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      Alert.alert("Error", "Failed to access camera. Please try again.");
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIdPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert("Error", "Failed to open camera. Please try again.");
    }
  };

  const openImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIdPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error opening image picker:", error);
      Alert.alert("Error", "Failed to open photo library. Please try again.");
    }
  };

  const calculateAmount = () => {
    const nights = parseInt(formData.nights) || 1;
    return nights * getRateForBedType(formData.bedType);
  };

  const getRateForBedType = (bedType: "A" | "B") =>
    Number(
      roomRatesData?.data.find((rate) => rate.bed_type === bedType)
        ?.rate_per_night ?? 2000
    );

  const appendIdPhoto = (form: FormData, uri: string) => {
    const filename = uri.split("/").pop() || "id-photo.jpg";
    const ext = filename.split(".").pop()?.toLowerCase();
    const mime =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    form.append("id_photo", {
      uri,
      name: filename,
      type: mime,
    } as any);
  };

  const handleCheckIn = async () => {
    const phone = formData.phone || phoneNumber;
    if (!formData.guestName?.trim()) {
      Alert.alert("Missing Information", "Please enter guest name.");
      return;
    }
    if (!isValidPhone(phone)) {
      Alert.alert("Invalid Phone", "Phone number must be 11 digits.");
      return;
    }

    try {
      // Build payload: use FormData only when we have an image
      let payload: CreateBookingData | FormData;

      const localIdPhotoUri = isLocalPhotoUri(idPhotoUri) ? idPhotoUri : null;

      if (localIdPhotoUri) {
        const form = new FormData();
        form.append("guest_name", formData.guestName);
        form.append("guest_phone", phone);
        form.append("number_of_nights", String(parseInt(formData.nights) || 1));
        form.append("preferred_bed_type", formData.bedType);
        form.append("payment_method", formData.paymentMethod);
        form.append("payer_name", formData.guestName);
        if (
          formData.paymentMethod === "transfer" &&
          formData.transferReference
        ) {
          form.append("reference", formData.transferReference);
        }

        appendIdPhoto(form, localIdPhotoUri);

        payload = form;
      } else {
        payload = {
          guest_name: formData.guestName,
          guest_phone: phone,
          number_of_nights: parseInt(formData.nights) || 1,
          preferred_bed_type: formData.bedType,
          payment_method: formData.paymentMethod,
          payer_name: formData.guestName,
          reference:
            formData.paymentMethod === "transfer"
              ? formData.transferReference
              : undefined,
        };
      }

      const response = await createBookingMutation.mutateAsync(payload);

      if (response.success) {
        const booking = response.data;
        const summaryRoute = {
          pathname: "/booking-summary",
          params: {
            id: booking.id?.toString() || "",
            booking_reference: booking.booking_reference || "",
            guest_name: booking.guest?.name || "",
            guest_phone: booking.guest?.phone || "",
            room_number: booking.room?.room_number || "",
            bed_type: booking.room?.bed_type || "",
            check_in_time: booking.check_in_time || "",
            check_out_time: booking.check_out_time || "",
            scheduled_checkout_time: booking.scheduled_checkout_time || "",
            number_of_nights: booking.number_of_nights?.toString() || "",
            status: booking.status || "",
            total_amount: booking.total_amount?.toString() || "",
            amount_paid: booking.amount_paid?.toString() || "",
            remaining_balance: booking.remaining_balance?.toString() || "",
          },
        } as const;

        router.replace(summaryRoute);
        return;
      }

      Alert.alert(
        "Check-In Failed",
        response.message || "The booking was not created. Please try again."
      );
    } catch (error: unknown) {
      Alert.alert("Check-In Failed", getErrorMessage(error));
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "phone", label: "Phone", icon: "call" },
      { key: "guest-info", label: "Guest Info", icon: "person" },
      { key: "payment", label: "Payment", icon: "card" },
    ];

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.stepItem}>
            <View
              style={[
                styles.stepIcon,
                currentStep === step.key && styles.activeStepIcon,
                steps.findIndex((s) => s.key === currentStep) > index &&
                  styles.completedStepIcon,
              ]}
            >
              <Ionicons
                name={step.icon as any}
                size={16}
                color={
                  currentStep === step.key ||
                  steps.findIndex((s) => s.key === currentStep) > index
                    ? theme.colors.white
                    : theme.colors.gray[500]
                }
              />
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep === step.key && styles.activeStepLabel,
              ]}
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPhoneStep = () => (
    <Card>
      <Text style={styles.sectionTitle}>Guest Lookup</Text>
      <Text style={styles.stepDescription}>
        Enter the guest's phone number to check if they are a returning
        customer.
      </Text>

      <Input
        label="Phone Number *"
        value={phoneNumber}
        onChangeText={handlePhoneChange}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        maxLength={11}
      />

      {foundGuest && (
        <View style={styles.foundGuestCard}>
          <View style={styles.guestHeader}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={theme.colors.success}
            />
            <Text style={styles.foundGuestTitle}>Returning Guest Found!</Text>
          </View>
          <Text style={styles.guestName}>{foundGuest.name}</Text>
          <Text style={styles.guestDetails}>Phone: {foundGuest.phone}</Text>
        </View>
      )}

      {phoneNumber && !foundGuest && !loading && (
        <View style={styles.newGuestCard}>
          <View style={styles.guestHeader}>
            <Ionicons name="person-add" size={24} color={theme.colors.info} />
            <Text style={styles.newGuestTitle}>New Guest</Text>
          </View>
          <Text style={styles.newGuestText}>
            This phone number is not in our system. You'll need to fill in their
            information.
          </Text>
        </View>
      )}

      <View style={styles.stepButtons}>
        <Button
          title="Lookup Guest"
          onPress={handlePhoneSubmit}
          loading={loading}
          disabled={!phoneNumber.trim()}
          style={styles.primaryButton}
        />

        {phoneNumber && (
          <Button
            title="Continue"
            onPress={proceedToGuestInfo}
            variant="outline"
            disabled={loading || !isValidPhone(phoneNumber)}
          />
        )}
      </View>
    </Card>
  );

  const renderGuestInfoStep = () => (
    <Card>
      <Text style={styles.sectionTitle}>Guest Information</Text>
      {foundGuest ? (
        <Text style={styles.stepDescription}>
          Please confirm or update the guest information below.
        </Text>
      ) : (
        <Text style={styles.stepDescription}>
          Please fill in the guest information below.
        </Text>
      )}

      <Input
        label="Guest Name *"
        value={formData.guestName}
        onChangeText={(value: string) => handleInputChange("guestName", value)}
        placeholder="Enter guest full name"
      />

      <Input
        label="ID Number"
        value={formData.idNumber}
        onChangeText={(value: string) => handleInputChange("idNumber", value)}
        placeholder="Enter ID number"
      />

      <TouchableOpacity style={styles.idPhotoButton} onPress={captureIdPhoto}>
        <Ionicons name="camera" size={24} color={theme.colors.secondary} />
        <Text style={styles.idPhotoText}>
          {idPhotoUri ? "Change ID Photo" : "Capture ID Photo"}
        </Text>
      </TouchableOpacity>

      {idPhotoUri && (
        <View style={styles.idPhotoPreview}>
          <View style={styles.photoContainer}>
            <Image source={{ uri: idPhotoUri }} style={styles.idPhotoImage} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => setIdPhotoUri(null)}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={theme.colors.error}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.idPhotoCaption}>ID Photo Captured</Text>
        </View>
      )}

      <Input
        label="Number of Nights"
        value={formData.nights}
        onChangeText={(value: string) => handleInputChange("nights", value)}
        placeholder="Enter number of nights"
        keyboardType="numeric"
      />

      <Text style={styles.inputLabel}>Bed Space Type</Text>
      <View style={styles.paymentMethod}>
        {(["A", "B"] as const).map((bedType) => {
          const rate =
            roomRatesData?.data.find((roomRate) => roomRate.bed_type === bedType)
              ?.rate_per_night ?? 2000;

          return (
            <TouchableOpacity
              key={bedType}
              style={[
                styles.paymentOption,
                formData.bedType === bedType && styles.selectedPayment,
              ]}
              onPress={() => handleInputChange("bedType", bedType)}
            >
              <Ionicons name="bed" size={24} color={theme.colors.secondary} />
              <Text style={styles.paymentText}>Type {bedType}</Text>
              <Text style={styles.rateText}>₦{Number(rate).toLocaleString()}/night</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.stepButtons}>
        <Button
          title="Back"
          onPress={goBack}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Continue to Payment"
          onPress={proceedToPayment}
          disabled={!formData.guestName.trim()}
        />
      </View>
    </Card>
  );

  const renderPaymentStep = () => (
    <Card>
      <Text style={styles.sectionTitle}>Payment Information</Text>
      <Text style={styles.stepDescription}>
        Complete the payment information to finalize the check-in.
      </Text>

      <View style={styles.paymentMethod}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            formData.paymentMethod === "cash" && styles.selectedPayment,
          ]}
          onPress={() => handleInputChange("paymentMethod", "cash")}
        >
          <Ionicons name="cash" size={24} color={theme.colors.secondary} />
          <Text style={styles.paymentText}>Cash</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentOption,
            formData.paymentMethod === "transfer" && styles.selectedPayment,
          ]}
          onPress={() => handleInputChange("paymentMethod", "transfer")}
        >
          <Ionicons name="card" size={24} color={theme.colors.secondary} />
          <Text style={styles.paymentText}>Transfer</Text>
        </TouchableOpacity>
      </View>

      {formData.paymentMethod === "transfer" && (
        <Input
          label="Transfer Reference"
          value={formData.transferReference}
          onChangeText={(value: string) =>
            handleInputChange("transferReference", value)
          }
          placeholder="Enter transfer reference"
        />
      )}

      <View style={styles.amountBreakdown}>
        <Text style={styles.breakdownText}>
          {formData.nights} nights × ₦
          {getRateForBedType(formData.bedType).toLocaleString()} = ₦
          {calculateAmount().toLocaleString()}
        </Text>
      </View>

      <View style={styles.stepButtons}>
        <Button
          title="Back"
          onPress={goBack}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="Complete Check-In"
          onPress={handleCheckIn}
          loading={loading}
          disabled={false}
        />
      </View>
    </Card>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Guest intake</Text>
        <Text style={styles.heroTitle}>Welcome a guest in</Text>
        <Text style={styles.heroSubtitle}>
          A guided check-in for finding guests, choosing a bed type, and settling payment.
        </Text>
      </View>
      {renderStepIndicator()}

      {currentStep === "phone" && renderPhoneStep()}
      {currentStep === "guest-info" && renderGuestInfoStep()}
      {currentStep === "payment" && renderPaymentStep()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAF1',
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  hero: {
    padding: theme.spacing.lg,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#DDEBD5',
  },
  heroEyebrow: {
    fontSize: theme.typography.fontSize.xs,
    color: '#6B8E36',
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize.xxl,
    color: '#143B1D',
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: '#55735C',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  stepDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDEBD5',
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
  activeStepIcon: {
    backgroundColor: theme.colors.secondary,
  },
  completedStepIcon: {
    backgroundColor: '#D0F253',
  },
  stepLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  activeStepLabel: {
    color: theme.colors.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  foundGuestCard: {
    backgroundColor: theme.colors.success + "10",
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.success + "30",
  },
  newGuestCard: {
    backgroundColor: theme.colors.info + "10",
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.info + "30",
  },
  guestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  foundGuestTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success,
    marginLeft: theme.spacing.sm,
  },
  newGuestTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.info,
    marginLeft: theme.spacing.sm,
  },
  guestName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  guestDetails: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
  },
  newGuestText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    lineHeight: 18,
  },
  stepButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  backButton: {
    marginRight: theme.spacing.sm,
  },
  idPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    borderStyle: "dashed",
    borderRadius: 8,
    marginBottom: theme.spacing.md,
  },
  idPhotoText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  idPhotoPreview: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  photoContainer: {
    position: "relative",
    width: "100%",
  },
  idPhotoImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.gray[100],
  },
  removePhotoButton: {
    position: "absolute",
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  idPhotoCaption: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  paymentMethod: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  paymentOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    borderRadius: 8,
  },
  selectedPayment: {
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondary + "10",
  },
  paymentText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.gray[700],
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  rateText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  amountBreakdown: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
    marginTop: theme.spacing.sm,
  },
  breakdownText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    textAlign: "center",
  },
});
