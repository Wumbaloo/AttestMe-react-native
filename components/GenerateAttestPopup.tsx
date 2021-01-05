import React, { useState, useEffect } from 'react';
import { View, ToastAndroid, StyleSheet } from 'react-native';
import { Dialog, Portal, TextInput, Button, Modal, Text, IconButton, Colors } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInputMask } from 'react-native-masked-text';
import { createPDF } from "./pdfUtils";

const GenerateAttestPopup = ({ profile, onCheckboxSelected, onConfirm }) => {
    const [visible, setVisible] = useState(false);
    const [visibleConfirm, setVisibleConfirm] = useState(false);
    const [date, setDate] = useState(new Date());
    const [dateMask, setDateMask] = useState(date.toLocaleDateString());
    const [time, setTime] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    useEffect(() => {
        let newDate = ("0" + date.getDate()).slice(-2) + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        setDateMask(newDate);
    }, [date]);

    const isProfileEqual = (profile1, profile2) => {
        Object.keys(profile1).forEach(element => {
            if (profile1[element] != profile2[element] && element !== "attests")
                return false;
        });
        return true;
    };

    const generate = async () => {
        hideDialog();
        let newDate = ("0" + date.getDate()).slice(-2) + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

        let timeFormatted = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2);
        let day = newDate;
        let result = await createPDF(profile, timeFormatted, day);
        if (result.success) {
            try {
              const value = await AsyncStorage.getItem('profiles');
              if (value !== null) {
                let obj = JSON.parse(value);
                obj.forEach(async (element, index) => {
                    if (isProfileEqual(element, profile)) {
                        if (!element['attests'])
                            element['attests'] = [];
                        try {
                            element['attests'].push({ title: result.data.title, createdDate: result.data.day, createdTime: result.data.time });
                            element['attests'] = JSON.stringify(element['attests']);
                            await AsyncStorage.setItem('profiles', JSON.stringify(obj));
                            return;
                        } catch (e) {
                            ToastAndroid.show(e, ToastAndroid.SHORT);
                        }
                    }
                });
              }
            } catch (e) {
              ToastAndroid.show("Impossible de récupérer vos profils.", ToastAndroid.LONG);
            }
        } else
            ToastAndroid.show("Une erreur est survenue. Veuillez réessayer.", ToastAndroid.LONG);
    };

    const renderContent = () => {
        return (
            <>
                <TextInput
                label={ "Date de sortie" }
                mode="outlined"
                style={ styles.inputField }
                value={ date.toLocaleDateString() }
                showSoftInputOnFocus={ false }
                onFocus={() => {
                    if (!showDate)
                        setShowDate(true);
                }}
                onChangeText={(text) => {
                    profile["time.date"] = text;
                }}
                render={props =>
                    <TextInputMask
                        {...props}
                        type={'datetime'}
                        options={{
                            format: 'MM/DD/YYYY',
                        }}
                        value={ dateMask }
                    />
                }
                />
                <TextInput
                label={ "Heure de sortie" }
                mode="outlined"
                style={ styles.inputField }
                value={ time.toLocaleTimeString("fr-FR") }
                showSoftInputOnFocus={ false }
                onFocus={() => {
                    if (!showTime)
                        setShowTime(true);
                }}
                onChangeText={(text) => {
                    profile["time.time"] = text;
                }}
                render={props =>
                    <TextInputMask
                        {...props}

                        type={'custom'}
                        options={{
                            mask: '99h99'
                        }}
                    />
                }
                />
                {showDate && (
                <DateTimePicker
                    value={date}
                    mode={"date"}
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDate(false);
                        setDate(selectedDate || date);
                    }}
                />
                )}
                {showTime && (
                <DateTimePicker
                    value={time}
                    mode={"time"}
                    is24Hour={true}
                    display="default"
                    onChange={(event, selectedTime) => {
                        setShowTime(false);
                        setTime(selectedTime || time);
                    }}
                />
                )}
            </>
        );
    };

    return (
        <>
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Quand est-ce que vous sortez ?</Dialog.Title>
                    <Dialog.Content>
                        {renderContent()}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Annuler</Button>
                        <Button onPress={generate}>Générer</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Portal>
                <Modal visible={visibleConfirm} onDismiss={() => setVisibleConfirm(false)} contentContainerStyle={ styles.confirmModal }>
                    <View style={ styles.confirmModalInsideView }>
                        <IconButton
                            icon="check-circle"
                            color={Colors.green500}
                            size={128}
                            onPress={() => setVisibleConfirm(false)}
                        />
                        <Text style={{ color: "black" }}>Attestation créée avec succès.</Text>
                        <Text style={{ textAlign: "center", marginVertical: 8 }}>
                            <Text style={{ color: "black" }}>Rendez-vous dans vos </Text>
                            <Text style={{ fontWeight: "bold", color: "black" }}>"Dernières attestation"</Text>
                            <Text style={{ color: "black" }}> pour la retrouver.</Text>
                        </Text>
                        <Button
                            mode="contained"
                            color={ Colors.green500 }
                            dark
                            style={{ marginTop: 8 }}
                            onPress={() => setVisibleConfirm(false)}
                        >
                            Continuer
                        </Button>
                    </View>
                </Modal>
            </Portal>
            <Button mode="outlined" onPress={showDialog}>Générer l'attestation</Button>
        </>
    );
};

const styles = StyleSheet.create({
    inputField: {
      marginVertical: 8
    },
    confirmModal: {
        backgroundColor: "white",
        borderRadius: 50,
        width: "75%",
        alignSelf: "center"
    },
    confirmModalInsideView: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        paddingHorizontal: 24,
        paddingBottom: 24
    }
});

export default GenerateAttestPopup;