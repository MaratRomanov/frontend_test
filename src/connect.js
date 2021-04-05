export default class Connection {                                            //компонент, совершающий запрос на geocode-maps.yandex.ru и получающий по названию места координаты для карты

    state = {
        url: 'https://geocode-maps.yandex.ru/1.x/?format=json&apikey=45ccaf60-7908-468d-adde-66b6dca72de5&geocode=',
        data: null
    }

    getRegion = (value) => {
        let coordsFromServer = [];

        for(let i = 0; i < value.length; i++){
            fetch(this.state.url + value[i].area_names[0])
                .then(res => res.json())
                .then(data => coordsFromServer.push(
                      {
                        coords: data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ').map(item => +item).reverse(), //координаты почему-то приходят наоборот, хотя в документации указано, что координаты должны приходить как надо. в общем полученные координаты были в виде текста и в неверном порядке, по этому здесь я их разворачиваю и длелаю из строки массив чисел
                        uuid: value[i].uuid,
                        name: value[i].name,
                      }
                    ))
                .catch(err => alert(err))
        }

        return coordsFromServer;                            //возвращаем результат - массив данных, полученных с сервера
    }

}