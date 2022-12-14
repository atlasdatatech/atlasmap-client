import React, { Component } from 'react';
import classNames from 'classnames';
import styles from './index.less';
import ScrollWrapper from '../../../components/ScrollWrapper';
import { ButtonGroup, Button, Spinner, Position, Divider, Card, Elevation } from "@blueprintjs/core";
import {loadAtlasByInspector} from '../../../utils/load';
import Local from '../../../utils/local';
import {ajax_get, ajax_post} from '../../../utils/ajax';
import {superbytes} from '../../../utils/file';
import {formatNum} from '../../../utils/util';
import dayjs from 'dayjs';
import DeleteAlert from '../../../components/modals/DeleteModal';
import router from 'umi/router';
import Toaster from '../../../components/Toaster';
import config from '../../../config';
import BlankCreate from '../../../components/BlankCreate';
import { detailMap } from '../../../map/detail';

export default class DatasetDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataset: null,
            showDelete: false,
            showBlank: false,
            url: '',
            layers: [],
            publishing: false,
        };
        this.mapPane = React.createRef();
        this.map = null;
    }

    initMap = () => {
        if(!this.mapPane.current) return;
        window.mapboxgl = atlas;
        this.map = detailMap({
            container: this.mapPane.current,
            url: this.state.url,
            tileset: this.state.dataset,
            updateState: ({layers}) => { 
                this.setState({layers});
            }
        });
    }
    
    componentWillUnmount() {
        if(this.map) {
            this.map.remove();
            this.map = null;
        }
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        this.setState({url: `datasets/x/${id}/`});
        ajax_get({
            url:`datasets/x/${id}/`, 
        }).then((res) => {
            if(res) {
                this.setState({ dataset: res });
                loadAtlasByInspector(this.initMap);
            } else {
                this.setState({showBlank: true});
                Toaster.show({message: '???????????????????????????', icon:'error', intent: 'danger', timeout: 2000});
                setTimeout(() => {
                    router.push('/dataset/list')
                }, 3000);
            }
        });
    }

    convert2Tileset = () => {
        this.setState({publishing: true});
        // http://47.100.237.57:1226/tilesets/{user}/create/{id}/
        const id = this.props.match.params.id;
        ajax_post({
            url:`ts/create/${id}/`, 
        }).then((res) => {
            if(res && res.code === 200) {
                this.setState({publishing: false});
                Toaster.show({message:'???????????????????????????????????????????????????', intent:'success', icon:'tick-circle'});
            } else {
                Toaster.show({message:'?????????????????????:' + res.msg, intent:'danger', icon:'error'});
            }
        });
    }

    getBBox() {
        const {dataset} = this.state;
        if(!dataset) return '';
        const {bounds} = this.state.dataset;
        if(!bounds) return '';
        const bbox = bounds.map(b => formatNum(String(b).substring(0, 10), 5))
        return <div><p>{bbox[0]}, {bbox[1]}</p><p>{bbox[2]}, {bbox[3]}</p></div>;
    }

    deleteHandler = () => {
        const {dataset} = this.state;
        const user = Local.get('name');
        ajax_post({
            url:`datasets/delete/${dataset.id}/`, 
        }).then((res) => {
            if(res && res.code === 200) {
                this.setState({dataset: null});
                router.push('/dataset/list');
            }
            this.setState({showDelete: false});
        }); 
    }

    render() {
        const {dataset, showBlank, layers, publishing} = this.state;
        if(showBlank) return  <BlankCreate desc='????????????????????????????????????????????????????????????' className='mgt-6' />;
        if(!dataset) return null;
        return (
            <div className={classNames(styles.main, 'h100 clear')}>
                <div className="pd-1 h100">
                    <Card elevation={Elevation.TWO} className={classNames(styles.card, 'h100')}>
                        <h2 className='pr-3 mgb-2  text-overflow'>{dataset.name}</h2>
                        <div className='pr-3 mgb-2'>
                            <ButtonGroup>
                                {/* <Button><i className="iconfont">&#xe62b;</i> ??????</Button> */}
                                {/* <Button onClick={() => {router.push('/dataset/list')}}><i className="iconfont">&#xe62b;</i> ????????????</Button> */}
                                <Button icon='inbox-geo' onClick={this.convert2Tileset} 
                                    className={classNames(styles.btns,'flex-vertical')}>
                                    <div>??????????????????</div><div>{publishing && <Spinner size={20} intent='success' />}</div> 
                                </Button>
                                <Button icon='trash' onClick={() => {this.setState({showDelete: true})}}>??????</Button>
                            </ButtonGroup>
                        </div>
                        <ScrollWrapper className={styles.scroll}  options={{suppressScrollX : true}}>
                            <table className={classNames(styles.table)}>
                                <tbody>
                                    {dataset.id && <tr><td>ID</td></tr>}
                                    {dataset.id && <tr><td>ID</td></tr>}
                                    {dataset.center && <tr><td>?????????</td></tr>}
                                    {dataset.center && <tr><td>{dataset.center.slice(0, 2).toString()}</td></tr>}
                                    {dataset.size && <tr><td>??????</td></tr> }
                                    {dataset.size && <tr><td>{superbytes(dataset.size)}</td></tr>}
                                    <tr><td>Bounds</td></tr>
                                    <tr><td>{this.getBBox()}</td></tr>
                                    {dataset.total && <tr><td>????????????</td></tr>}
                                    {dataset.total && <tr><td>{dataset.total}</td></tr>}
                                    <tr><td>????????????</td></tr>
                                    <tr><td>{dayjs(dataset.updated_at).format("YYYY-MM-DD HH:MM:ss")}</td></tr>
                                    <tr><td>????????????</td></tr>
                                    <tr><td>{dayjs(dataset.created_at).format("YYYY-MM-DD HH:MM:ss")}</td></tr>
                                </tbody>
                            </table>
                        </ScrollWrapper>
                    </Card>
                </div>
                <div className="pd-1 h100">
                    <div ref={this.mapPane} className={classNames(styles.map, 'h100 fill-canvas')}></div>
                </div>
                <DeleteAlert 
                    isOpen={this.state.showDelete} 
                    desc='?????????????????????????????????????????????????????????????????????????????????????????????'
                    cancelHandler={() => {this.setState({showDelete: false})}}
                    confirmHandler = {this.deleteHandler}
                 />
            </div>
        )
    }
}