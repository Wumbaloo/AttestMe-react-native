import React, { useState, useEffect } from 'react';
import { View, ToastAndroid, ScrollView } from 'react-native';
import { Dialog, Portal, Text, Button, Checkbox } from 'react-native-paper';
import { reasons } from '../assets/reasons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChooseReason = ({ profile, onCheckboxSelected, onConfirm }) => {
    const [visible, setVisible] = useState(false);
    const [checkboxes, setCheckboxes] = useState([]);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    useEffect(() => {
        let checkboxs = [];

        if (!profile)
            return;
        reasons.forEach((element, index) => {
            checkboxs.push({ id: index, title: element, checked: profile.reasons && typeof(profile.reasons[index]) === "number" });
        });
        setCheckboxes(checkboxs);
    }, []);

    const updateCheckBox = (index) => {
        if (!checkboxes[index])
            return;
        checkboxes[index].checked = !checkboxes[index].checked;
        onCheckboxSelected();
        setCheckboxes(checkboxes);
    };

    const saveReasons = async () => {
        // await AsyncStorage.setItem('profiles', JSON.stringify([{'name.first':'William','name.last':'Gaudfrin','birth.day':'18122000','birth.place':'Croix','home.street':'540 rue Voltaire','home.city':'Raimbeaucourt','home.zipcode':'59283'}]));
        try {
          const value = await AsyncStorage.getItem('profiles');
          if (value !== null) {
            let obj = JSON.parse(value);
            let chosenReasons = [];
            checkboxes.forEach(element => {
                if (element.checked)
                    chosenReasons.push(element.id);
            });
            let profileStr = JSON.stringify(profile);
            obj.forEach((element, index) => {
                if (JSON.stringify(element) === profileStr) {
                    element.reasons = chosenReasons;
                }
            });
            await AsyncStorage.setItem('profiles', JSON.stringify(obj));
            ToastAndroid.show("Motifs enregistrés avec succès.", ToastAndroid.SHORT);
            onConfirm(obj);
        } else
            ToastAndroid.show("Impossible de sauvegarder vos choix. Réessayez.", ToastAndroid.LONG);
        } catch (e) {
          ToastAndroid.show("Impossible de sauvegarder vos choix. Réessayez.", ToastAndroid.LONG);
        }
        hideDialog();
    };

    const renderReasons = () => {
        return (
            reasons.map((value, index) => {
                return (
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center", overflow: "hidden", marginVertical: 4 }} key={index}>
                        <Checkbox
                        status={checkboxes[index] && checkboxes[index].checked ? 'checked' : 'unchecked'}
                        onPress={() => {
                            updateCheckBox(index);
                        }}
                        />
                        <Text>{ value }</Text>
                    </View>
                )
            })
        );
    };

    return (
        <>
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Choisissez la raison de votre déplacement :</Dialog.Title>
                    <Dialog.ScrollArea>
                        <ScrollView>
                            <Text style={{ fontSize: 12, marginVertical: 4 }}>Je certifie que mon déplacement est lié au motif suivant (cocher la case) autorisé par le décret n°2020-1310 du 29 octobre 2020 prescrivant les mesures générales nécessaires pour faire face à l'épidémie de Covid19 dans le cadre de l'état d'urgence sanitaire</Text>
                            {renderReasons()}
                        </ScrollView>
                    </Dialog.ScrollArea>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Annuler</Button>
                        <Button onPress={saveReasons} disabled={ checkboxes.filter((obj) => obj.checked).length === 0 }>Modifier</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Button mode="outlined" onPress={showDialog}>Modifier le motif</Button>
        </>
    );
};

export default ChooseReason;