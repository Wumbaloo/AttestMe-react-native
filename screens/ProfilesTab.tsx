import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, SafeAreaView, ToastAndroid, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInputMask } from 'react-native-masked-text';

const ProfilesTab = ( { navigation } ) => {
  const [infos, setInfos] = useState({});
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    updateFields();
    // profileStore.subscribe(() => console.log(profileStore.getState()));
  }, []);

  const fields = [
    {
      name: 'Prénom',
      key: 'name.first',
      type: 'default'
    },
    {
      name: 'Nom',
      key: 'name.last',
      type: 'default'
    },
    {
      name: 'Date de naissance',
      key: 'birth.day',
      type: 'phone-pad'
    },
    {
      name: 'Lieu de naissance',
      key: 'birth.place',
      type: 'default'
    },
    {
      name: 'Adresse',
      key: 'home.street',
      type: 'default'
    },
    {
      name: 'Ville',
      key: 'home.city',
      type: 'default'
    },
    {
      name: 'Code postal',
      key: 'home.zipcode',
      type: 'numeric'
    }
  ];

  const updateFields = async () => {
    try {
      const value = await AsyncStorage.getItem('profiles');
      if (value !== null) {
        let obj = JSON.parse(value);
        for (let key of Object.keys(obj[0])) {
          if (key === "birth.day") {
            infos[key] = ("0" + obj[0][key].slice(0, 2)).slice(-2) + "/" + ("0" + obj[0][key].slice(2, 4)).slice(-2) + "/" + obj[0][key].slice(4);
          } else
            infos[key] = obj[0][key];
        }
        setInfos(infos);
      }
    } catch (e) {
      ToastAndroid.show("Impossible de récupérer vos profils.", ToastAndroid.LONG);
    }
  }

  const textInput = (item) => (
    <TextInput
      key={ item.key }
      label={ item.name }
      mode="outlined"
      style={ styles.inputField }
      keyboardType={ item.type }
      value={ infos[item.key] }
      onChangeText={(text) => {
        infos[item.key] = text;
        setInfos(infos);
        setUpdate(!update);
      }}
      onBlur={(text) => {
        // SAVE PROFILE ?
      }}
      render={(item.key === "birth.day") ? props =>
          <TextInputMask
              {...props}
              type={'datetime'}
              options={{
                  format: 'DD/MM/YYYY',
              }}
          />
          :
          undefined
      }
    />
  );

  const saveProfile = async () => {
    let savedProfiles: any = [{}];
    if (Object.keys(infos).length < fields.length) {
      ToastAndroid.show("Merci de compléter tous les  champs.", ToastAndroid.LONG);
      return;
    }
    // try {
    //   const value = await AsyncStorage.getItem('profiles');
    //   if (value !== null)
    //     savedProfiles = JSON.parse(value);
    // } catch (e) {
    //   ToastAndroid.show("Erreur lors de la sauvegarde de votre profil.", ToastAndroid.LONG);
    // }
    try {
      infos['birth.day'] = infos['birth.day'].split('/').join('-');
      for (let key of Object.keys(fields))
        savedProfiles[0][fields[key]['key']] = infos[fields[key]['key']];
      // profileStore.dispatch({ type: 'set', profiles: savedProfiles });
      await AsyncStorage.setItem('profiles', JSON.stringify(savedProfiles));
      // setProfiles(savedProfiles);
      ToastAndroid.show("Profil enregistré avec succès.", ToastAndroid.SHORT);
    } catch (e) {
      ToastAndroid.show(e, ToastAndroid.SHORT);
    }
  };

  return (
    <SafeAreaView style={ styles.container }>
      <ScrollView style={{ width: "80%" }}>
        <Text style={{ textAlign: "center", marginVertical: 16}}>
          Tous les champs sont obligatoires.
        </Text>
        {fields.map((item, index) => {
            return (
                textInput(item)
            );
          })
        }
        <Button mode="contained" onPress={saveProfile} dark style={{ margin: 20 }}>
          Sauvegarder
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputField: {
    marginVertical: 8
  }
});

export default ProfilesTab;