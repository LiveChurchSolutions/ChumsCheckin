import React from 'react'
import { View, Text, FlatList } from 'react-native'
import { Container } from 'native-base'
import Ripple from 'react-native-material-ripple';
import { RouteProp } from '@react-navigation/native';
import { ScreenList } from './ScreenList'
import { Header } from './components'
import { screenNavigationProps, VisitHelper, VisitSessionHelper, CachedData, Styles, StyleConstants, GroupInterface } from "../helpers"
import Icon from 'react-native-vector-icons/FontAwesome';
import { widthPercentageToDP as wp} from 'react-native-responsive-screen';

type ProfileScreenRouteProp = RouteProp<ScreenList, 'SelectGroup'>;
interface Props { navigation: screenNavigationProps; route: ProfileScreenRouteProp; }
interface GroupCategoryInterface { key: number, name: string, items: GroupInterface[] }

export const SelectGroup = (props: Props) => {
    const [selectedCategory, setSelectedCategory] = React.useState(-1);
    const [groupTree, setGroupTree] = React.useState<GroupCategoryInterface[]>([]);

    const buildTree = () => {
        var category = "";
        var gt: GroupCategoryInterface[] = [];

        const sortedGroups = props.route.params.serviceTime?.groups?.sort((a, b) => {
            return ((a.categoryName || "") > (b.categoryName || "")) ? 1 : -1;
        });

        sortedGroups?.forEach(g => {
            if (g.categoryName !== category) gt.push({ key: gt.length, name: g.categoryName || "", items: [] })
            gt[gt.length - 1].items.push(g);
            category = g.categoryName || "";
        })
        setGroupTree(gt);
    }

    const handleCategoryClick = (value: number) => { setSelectedCategory((selectedCategory == value) ? -1 : value); }
    const handleNone = () => { selectGroup("", "NONE"); }

    const selectGroup = (id: string, name: string) => {
        const personId = props.route.params.personId;
        var visit = VisitHelper.getByPersonId(CachedData.pendingVisits, personId);
        if (visit === null) {
            visit = { personId: personId, serviceId: CachedData.serviceId, visitSessions: [] };
            CachedData.pendingVisits.push(visit);
        }
        const vs = visit?.visitSessions || [];
        const serviceTimeId = props.route.params.serviceTime.id || "";
        VisitSessionHelper.setValue(vs, serviceTimeId, id, name);
        props.navigation.goBack()
    }


    const getRow = (data: any) => {
        const item: GroupCategoryInterface = data.item;
        return (
            <View>
                <Ripple style={Styles.flatlistMainView} onPress={() => { handleCategoryClick(item.key) }}  >
                    <Icon name={(selectedCategory === item.key) ? 'angle-down' : 'angle-right'} style={Styles.flatlistDropIcon} size={wp('6%')} />
                    <Text style={[Styles.bigLinkButtonText, { margin: wp('3%') }]}>{item.name}</Text>
                </Ripple>
                { getExpanded(selectedCategory, item)}
            </View>
        )
    }

    const getExpanded = (selectedCategory: number, category: GroupCategoryInterface) => {
        if (selectedCategory !== category.key) return null;
        else {
            const result: JSX.Element[] = [];
            category.items.forEach(g => {
                result.push(<Ripple key={g.id?.toString()} style={[Styles.expandedRow, { justifyContent: "flex-start", width: wp('80%') }]} onPress={() => selectGroup(g.id || "", g.name || "")}>
                    <Text style={[Styles.bigLinkButtonText, { marginLeft: '5%', fontFamily: StyleConstants.RobotoRegular, marginVertical: wp('1%') }]}>{g.name}</Text>
                </Ripple>);
            })
            return result;
        }
    }

    React.useEffect(buildTree, []);

    return (
        <Container>
            <Header />
            <View style={Styles.fullWidthContainer}>
                <FlatList data={groupTree} renderItem={getRow} keyExtractor={(item: GroupCategoryInterface) => item.name} />
                <View style={Styles.blockButtons}>
                    <Ripple style={[Styles.blockButton, { backgroundColor: StyleConstants.redColor }]} onPress={handleNone}>
                        <Text style={Styles.blockButtonText}>NONE</Text>
                    </Ripple>
                </View>
            </View>
        </Container>
    );

}