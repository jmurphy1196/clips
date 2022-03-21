import {
  Component,
  OnInit,
  ContentChildren,
  AfterContentInit,
  QueryList,
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.scss'],
})
export class TabsContainerComponent implements OnInit, AfterContentInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> =
    new QueryList();
  constructor() {}

  ngOnInit(): void {
    console.log(this.tabs);
  }
  ngAfterContentInit(): void {
    console.log(this.tabs);
    const activeTabs = this.tabs.filter((tab) => tab.active === true);
    if (!activeTabs || activeTabs.length === 0) {
      //make sure the first tab is at least always active when opening
      this.selectTab(this.tabs!.first);
    }
  }
  selectTab(tab: TabComponent) {
    this.tabs.forEach((t) => {
      t.active = false;
    });
    tab.active = true;

    //prevents default behavior of anchor tags
    return false;
  }
  setTabClasses(tab: TabComponent) {
    return {
      'hover:text-indigo-400': !tab.active,
      'hover:text-white text-white bg-indigo-400': tab.active,
    };
  }
}
