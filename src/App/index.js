import React from 'react';
import './App.css';
import regions from '../regions.json';
import waterbases from '../waterbases.json';
import connect from '../connect';
import { YMaps, Map, Clusterer, Placemark } from 'react-yandex-maps';

const mapState = {
  center: [55.75, 37.57],
  zoom: 5
};

export default class App extends React.Component {

  connect = new connect();          

  state={
    start: false,
    regionsWithCoords: null,   
    chosenRegion: '',
    chosenWaterbaseName: '',
    chosenWaterbaseCode: null,
    waterbaseFiltered: waterbases.data,
    waterVolume: ''
  }

  componentDidMount(){ 
    let res = this.connect.getRegion(regions.data);             //вызов метода, дёргающего координаты для переданного массива с названиями регионов.
    this.setState({ regionsWithCoords: res });                  //записываем пришедшие данные в state
  }

  inputWaterbase = (e) => {
    this.setState({ chosenWaterbaseName: e.target.value });      //получаем значение, введенное в поле "куда доставить воду", записываем его в state

    if(e.target.value === ""){                                   //обнуляем данные в случае, если пользователь удалил данные из поля ввода
      this.setState({
        chosenWaterbaseName: "",
        chosenWaterbaseCode: null
      })
    }

    let filteredWaterbase = [];

    for(let i = 0; i < waterbases.data.length; i++){             //проверяем, есть ли совпадения среди названий водных баз с введенными данными
      if( waterbases.data[i].name.toLowerCase().includes(e.target.value)){
        filteredWaterbase.push(waterbases.data[i])                //если есть - помещаем в массив отфильтрованных 
      }
    }

    this.setState({ waterbaseFiltered: filteredWaterbase });     //записываем отфильтрованный массив в state

  }

  selectRegion = (value) => {
    this.setState({ chosenRegion: value });

    let filteredWaterbase = [];                                 //схожий с верхним механизм фильтра 

    for(let i = 0; i < waterbases.data.length; i++){
      if( waterbases.data[i].region_uuid.includes(value)){
        filteredWaterbase.push(waterbases.data[i])
      }
    }

    this.setState({ waterbaseFiltered: filteredWaterbase });

  }

  submit = () => {                                            //кнопка "заказать"
    const { regionsWithCoords, chosenRegion, chosenWaterbaseName, waterVolume } = this.state;
    let whereFrom = null;

    for(let i = 0; i < regionsWithCoords.length; i++){
      if(regionsWithCoords[i].uuid.includes(chosenRegion)){
        whereFrom = regionsWithCoords[i].name                 //ищем название офиса продаж по выбранному uuid
      }
    }

    alert(`Поздравляем! Вы заказали: ${waterVolume.toFixed(2)} тонн(ы) воды, она будет привезена из ${whereFrom} в ${chosenWaterbaseName}`);
  }

  render(){
    const { 
       start, 
       regionsWithCoords, 
       chosenRegion, 
       chosenWaterbaseName, 
       waterbaseFiltered, 
       waterVolume, 
       chosenWaterbaseCode 
    } = this.state;    

    return (
      <div className="App">
        {start
          ? <>
            <YMaps>
              <Map
                defaultState={mapState} 
                style={{
                  height: '500px',
                  width: '500px'
                }}
              >                          
                <Clusterer
                options={{
                  preset: "islands#invertedVioletClusterIcons",
                  groupByCoordinates: false
                }}
              >  
                {regionsWithCoords.map(region =>              
                  <Placemark
                    key={region.uuid}
                    geometry={region.coords}
                    options={{
                      iconColor: chosenRegion === region.uuid ? '#34d51f' : ''
                    }}
                    onClick={() => this.selectRegion(region.uuid)}
                  />  
                )}                  
              </Clusterer>
              </Map>
            </YMaps>  
            <div className="App-search">              
              <select
                value={chosenRegion}
                onChange={(e) => this.selectRegion(e.target.value)}
              >
                  <option
                    value={""} 
                    disabled 
                  >
                    Выберите офис продаж
                  </option>
                {regionsWithCoords.map(office =>
                  <option
                    key={office.uuid}                      
                    value={office.uuid}  
                  >
                    {office.name}
                  </option>
                )}
              </select>             
              <input 
                type="number"
                min="0"
                placeholder="Сколько вам нужно воды (в тоннах) ?"
                onChange={(e) => this.setState({ waterVolume: +e.target.value })}
                style={{
                  marginTop: '20px'
                }}
              />              
              <input  
                  placeholder="Куда доставить воду"                
                  value={chosenWaterbaseName}
                  onChange={this.inputWaterbase}
                  style={{
                    margin: '20px 0'
                  }}
              />
              <span>Доступные адреса доставки воды:</span>
              <div className='waterbases'>
                {waterbaseFiltered.map(base => 
                  <div
                    className='base'
                    key={base.uuid}
                    onClick={() => this.setState({ 
                      chosenWaterbaseName: base.name,
                      chosenWaterbaseCode: base.uuid,
                      chosenRegion: base.region_uuid,
                    })}
                    style={{
                      backgroundColor: chosenWaterbaseCode === base.uuid ? '#6c7382' : ''
                    }}
                  >
                    {base.name}
                  </div>
                )}
              </div>
              <button
                style={{
                  marginTop: '20px',
                  width: '100px'
                }}
                onClick={this.submit}
                disabled={waterVolume === '' || waterVolume === '0' || chosenRegion === '' || chosenWaterbaseName === ''
                  ? true
                  : false
                }
              >
                Заказать
              </button> 
            </div> 
          </> 
          : <button 
              onClick={() => this.setState({ start: true })}
            >
              Запустить приложение по заказзу воды
            </button>  
        }        
      </div>
    );
  }
}