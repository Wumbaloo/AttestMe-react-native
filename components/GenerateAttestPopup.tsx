import React, { useState, useEffect } from 'react';
import { View, ToastAndroid, StyleSheet } from 'react-native';
import { Dialog, Portal, TextInput, Button } from 'react-native-paper';
import { reasons } from '../assets/reasons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInputMask } from 'react-native-masked-text';
import { createPDF } from "./pdfUtils";

const GenerateAttestPopup = ({ profile, onCheckboxSelected, onConfirm }) => {
    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState(new Date());
    const [dateMask, setDateMask] = useState(date.toLocaleDateString());
    const [time, setTime] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    useEffect(() => {
        let newDate = ("0" + date.getDate()).slice(-2) + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        console.log(newDate);
        console.log(date.toString());
        setDateMask(newDate);
    }, [date]);

    const generate = async () => {
        hideDialog();
        createPDF(profile);
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
            <Button mode="outlined" onPress={showDialog}>Générer l'attestation</Button>
        </>
    );
};

const styles = StyleSheet.create({
    inputField: {
      marginVertical: 8
    }
});

export default GenerateAttestPopup;